import os
import json
import hashlib
from langchain_community.document_loaders import PyPDFLoader, PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
import config


# ---------------- Yardımcılar ----------------
def _get_embeddings():
    """Embedding modelini singleton olarak döndürür."""
    return HuggingFaceEmbeddings(model_name=config.EMBEDDING_MODEL)


def _file_hash(path: str) -> str:
    """Dosya içeriğinden SHA-256 hash üretir (değişiklik tespiti için)."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def _load_registry() -> dict:
    """{filename: hash} kaydını yükler."""
    if not os.path.exists(config.DOCUMENT_REGISTRY):
        return {}
    try:
        with open(config.DOCUMENT_REGISTRY, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def _save_registry(reg: dict):
    with open(config.DOCUMENT_REGISTRY, "w", encoding="utf-8") as f:
        json.dump(reg, f, ensure_ascii=False, indent=2)


def _split_documents(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=config.CHUNK_SIZE,
        chunk_overlap=config.CHUNK_OVERLAP,
    )
    return splitter.split_documents(documents)


# ---------------- Ana Fonksiyonlar ----------------
def create_or_get_vectordb():
    """
    Vektör veritabanını yükler. İlk çalıştırmada tüm PDF'leri işler,
    sonraki çalıştırmalarda diskten okur (çok hızlı).
    Yeni/değişen dosyaları otomatik olarak ekler.
    """
    embeddings = _get_embeddings()

    # Diskten mevcut Chroma'yı yükle (veya boş oluştur)
    vectordb = Chroma(
        persist_directory=config.CHROMA_PERSIST_DIR,
        embedding_function=embeddings,
    )

    # Kaynak klasörü kontrol et
    if not os.path.exists(config.FOLDER_NAME):
        os.makedirs(config.FOLDER_NAME)

    pdf_files = [
        f for f in os.listdir(config.FOLDER_NAME)
        if f.lower().endswith(".pdf")
    ]

    if not pdf_files:
        # Hiç PDF yok ve DB boşsa None döndür
        if vectordb._collection.count() == 0:
            return None
        return vectordb

    registry = _load_registry()
    current_hashes = {}
    new_or_changed = []
    removed = []

    # Hangi dosyalar yeni/değişmiş?
    for fname in pdf_files:
        fpath = os.path.join(config.FOLDER_NAME, fname)
        h = _file_hash(fpath)
        current_hashes[fname] = h
        if registry.get(fname) != h:
            new_or_changed.append(fname)

    # Hangi dosyalar silinmiş?
    for fname in registry.keys():
        if fname not in current_hashes:
            removed.append(fname)

    # --- SİLİNENLERİ DB'DEN ÇIKAR ---
    for fname in removed:
        fpath_abs = os.path.abspath(os.path.join(config.FOLDER_NAME, fname))
        # LangChain metadata "source" alanında tam yol tutar
        try:
            vectordb._collection.delete(where={"source": fpath_abs})
            print(f"🗑️  Silindi: {fname}")
        except Exception as e:
            print(f"Silme hatası ({fname}): {e}")

    # --- YENİ/DEĞİŞENLERİ EKLE ---
    for fname in new_or_changed:
        fpath = os.path.join(config.FOLDER_NAME, fname)
        fpath_abs = os.path.abspath(fpath)

        # Değişmişse önce eski kayıtları sil
        if fname in registry:
            try:
                vectordb._collection.delete(where={"source": fpath_abs})
            except Exception:
                pass

        print(f"📄 İşleniyor: {fname}")
        loader = PyPDFLoader(fpath)
        docs = loader.load()
        if not docs:
            continue

        chunks = _split_documents(docs)
        vectordb.add_documents(chunks)
        print(f"✅ {fname} → {len(chunks)} parça eklendi")

    # Registry'yi güncelle
    _save_registry(current_hashes)

    if vectordb._collection.count() == 0:
        return None
    
    print("Toplam chunk sayısı:", vectordb._collection.count())

    return vectordb


def add_single_pdf(vectordb, file_path: str):
    """Tek bir PDF'i mevcut DB'ye ekler (upload sonrası)."""
    if vectordb is None:
        return create_or_get_vectordb()

    fname = os.path.basename(file_path)
    fpath_abs = os.path.abspath(file_path)

    # Aynı isimde varsa önce sil
    try:
        vectordb._collection.delete(where={"source": fpath_abs})
    except Exception:
        pass

    print(f"📄 İşleniyor: {fname}")
    loader = PyPDFLoader(file_path)
    docs = loader.load()
    if not docs:
        return vectordb

    chunks = _split_documents(docs)
    vectordb.add_documents(chunks)

    # Registry güncelle
    registry = _load_registry()
    registry[fname] = _file_hash(file_path)
    _save_registry(registry)

    print(f"✅ {fname} → {len(chunks)} parça eklendi")
    return vectordb


def delete_pdf(vectordb, filename: str):
    """PDF'i hem diskten hem DB'den siler."""
    fpath = os.path.join(config.FOLDER_NAME, filename)
    fpath_abs = os.path.abspath(fpath)

    # DB'den sil
    if vectordb is not None:
        try:
            vectordb._collection.delete(where={"source": fpath_abs})
        except Exception as e:
            print(f"DB silme hatası: {e}")

    # Diskten sil
    if os.path.exists(fpath):
        os.remove(fpath)

    # Registry'den sil
    registry = _load_registry()
    registry.pop(filename, None)
    _save_registry(registry)

    print(f"🗑️  {filename} tamamen silindi")


def list_documents():
    """Kayıtlı tüm belgeleri döndürür."""
    if not os.path.exists(config.FOLDER_NAME):
        return []
    files = []
    for fname in sorted(os.listdir(config.FOLDER_NAME)):
        if fname.lower().endswith(".pdf"):
            fpath = os.path.join(config.FOLDER_NAME, fname)
            files.append({
                "filename": fname,
                "size_kb": round(os.path.getsize(fpath) / 1024, 1),
            })
    return files


def retrieve_documents(vectordb, query):
    """Kullanıcının sorusuna en uygun metin parçalarını getirir."""
    retriever = vectordb.as_retriever(search_kwargs={"k": config.SEARCH_K})
    source_docs = retriever.invoke(query)
    context_text = "\n\n".join([doc.page_content for doc in source_docs])
    return source_docs, context_text