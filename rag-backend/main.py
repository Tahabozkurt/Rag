#dosya Adı: main.py
import os
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.llms import Ollama

def main():
    print("--- Kurumsal Hukuk ve Mevzuat Asistanı Başlatılıyor (Modern Mimari) ---\n")
    
    # 1. Mevzuat Klasörü Kontrolü
    folder_name = "mevzuat_kaynaklari"
    if not os.path.exists(folder_name):
        os.makedirs(folder_name)
        print(f"Sistem: '{folder_name}' klasörü oluşturuldu.")
        print("Lütfen içine PDF formatında mevzuat ekleyip tekrar çalıştırın.")
        return

    # 2. PDF'leri Yükleme
    print("1. Mevzuat PDF'leri taranıyor...")
    loader = PyPDFDirectoryLoader(folder_name)
    documents = loader.load()
    
    if not documents:
        print(f"Uyarı: '{folder_name}' klasöründe PDF bulunamadı. Lütfen belge ekleyin.")
        return
        
    # 3. Metinleri Parçalama
    print("2. Hukuki metinler indeksleniyor...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    texts = text_splitter.split_documents(documents)
    
    # 4. Vektör Veritabanı (Hafıza)
    print("3. Vektör veritabanı hazırlanıyor...")
    embeddings = HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-base")
    vectordb = Chroma.from_documents(documents=texts, embedding=embeddings)
    
    # Sadece retriever (getirici) özelliğini kullanıyoruz
    retriever = vectordb.as_retriever(search_kwargs={"k": 5})
    
    # 5. Ollama Modeli
    print("4. Ollama (Hukuk Motoru) bağlanıyor...\n")
    llm = Ollama(model="qwen2:1.5b")
    
    print("-" * 70)
    print("Sistem Hazır! Mevzuatla ilgili sorunuzu sorabilirsiniz. (Çıkış: 'q')")
    print("-" * 70)
    
    # 6. Doğrudan (Manuel) RAG Döngüsü
    while True:
        query = input("\nSorunuz: ")
        
        if query.lower() in ['q', 'cikis', 'exit', 'quit']:
            break
        if not query.strip():
            continue
            
        print("\nAsistan mevzuatı tarıyor ve cevap üretiyor...")
        
        # ADIM A: Sorunla eşleşen en iyi 3 PDF parçasını bul
        source_docs = retriever.invoke(query)
        
        # ADIM B: Bulunan metinleri birleştir
        context_text = "\n\n".join([doc.page_content for doc in source_docs])
        print("\n--- YAPAY ZEKANIN ŞU AN OKUDUĞU METİN ---")
        print(context_text)
        print("-------------------------------------------\n")
        
        # ADIM C: Kendi Prompt'umuzu (Komutumuzu) oluştur
        prompt = f"""Sen kurumsal bir bankacılık ve hukuk asistanısın. 
                Sana verilen aşağıdaki MEVZUAT METNİ'ni kullanarak soruyu cevapla.
                Eğer cevap mevzuat metninde yoksa 'Bu bilgi sağlanan dokümanlarda bulunmuyor' de.
        
                MEVZUAT METNİ:
                {context_text}
        
                SORU: {query}
                
                CEVAP:"""
        
        # ADIM D: Modeli doğrudan çalıştır (Chains kullanmadan)
        result = llm.invoke(prompt)
        
        # Yanıtı ve Kaynakları Yazdırma
        print(f"\n[YANIT]:\n{result.strip()}\n")
        
        print("[KAYNAKLAR]:")
        for i, doc in enumerate(source_docs):
            source_file = os.path.basename(doc.metadata.get('source', 'Bilinmeyen Belge'))
            page_num = doc.metadata.get('page', 0) + 1
            print(f"  {i+1}. Belge: {source_file} | Sayfa: {page_num}")

if __name__ == "__main__":
    main()