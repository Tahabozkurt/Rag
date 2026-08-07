# Dosya Adı: api.py
"""
FastAPI backend - mevcut Streamlit mantığını (database.py, llm_service.py,
document_manager.py) HTTP API olarak dışarı açar. Bu dosya app.py'nin yerini almaz,
onunla birlikte var olabilir.

Çalıştırmak için:
    uvicorn api:app --reload --port 8000

Swagger dokümantasyonu (otomatik):
    http://localhost:8000/docs
"""

import os
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import config
from database import (
    create_or_get_vectordb,
    retrieve_documents,
    add_single_pdf,
    delete_pdf,
    list_documents,
)
from document_manager import save_uploaded_files
from llm_service import generate_answer

# ------------------------------------------------------------------
# Global state: vektör veritabanını uygulama ayağa kalkarken yükle
# ------------------------------------------------------------------
state = {"vectordb": None}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: uygulama ayağa kalkarken vectordb'yi bir kere yükle
    print("Vektör veritabanı yükleniyor...")
    state["vectordb"] = create_or_get_vectordb()
    if state["vectordb"] is None:
        print("Uyarı: Kaynak klasöründe hiç PDF bulunamadı.")
    else:
        print("Vektör veritabanı hazır.")
    yield
    # Shutdown: şimdilik temizlenecek bir şey yok
    state.clear()


app = FastAPI(title="Kurumsal Mevzuat Asistanı API", lifespan=lifespan)

# ------------------------------------------------------------------
# CORS: Next.js frontend (localhost:3000) farklı porttan istek atacağı için gerekli
# ------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------
# Request / Response modelleri
# ------------------------------------------------------------------
class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    query: str
    history: Optional[List[ChatMessage]] = []


class SourceDoc(BaseModel):
    source: str
    page: int
    snippet: str


class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceDoc]
    has_sources: bool


class UploadResponse(BaseModel):
    saved_count: int
    filenames: List[str]
    message: str


class StatusResponse(BaseModel):
    ready: bool
    model: str
    embedding_model: str


# ------------------------------------------------------------------
# Endpoints
# ------------------------------------------------------------------
@app.get("/api/status", response_model=StatusResponse)
def get_status():
    """Sistemin hazır olup olmadığını ve hangi modelleri kullandığını döner."""
    return StatusResponse(
        ready=state["vectordb"] is not None,
        model=config.AZURE_DEPLOYMENT_NAME,
        embedding_model=config.EMBEDDING_MODEL,
    )


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """Kullanıcının sorusunu alır, ilgili belgeleri bulur ve cevap üretir."""
    if state["vectordb"] is None:
        raise HTTPException(
            status_code=400,
            detail="Sistemde kaynak bulunamadı. Önce PDF belgesi yükleyin.",
        )

    if not req.query.strip():
        raise HTTPException(status_code=422, detail="Soru boş olamaz.")

    # Son 3 mesajdan geçmiş metni oluştur (app.py'deki mantığın aynısı)
    history_str = ""
    for msg in req.history[-3:]:
        if msg.role == "user":
            history_str += f"{msg.content} "

    search_query = f"{history_str} {req.query}"
    source_docs, context_text = retrieve_documents(state["vectordb"], search_query)

    answer = generate_answer(req.query, context_text, history_str)

    has_sources = "bulunmuyor" not in answer.lower()

    sources = []
    if has_sources:
        for doc in source_docs:
            sources.append(
                SourceDoc(
                    source=os.path.basename(doc.metadata.get("source", "Bilinmeyen Belge")),
                    page=doc.metadata.get("page", 0) + 1,
                    snippet=doc.page_content[:250],
                )
            )

    return ChatResponse(answer=answer, sources=sources, has_sources=has_sources)


@app.post("/api/upload", response_model=UploadResponse)
async def upload_documents(files: List[UploadFile] = File(...)):
    """PDF dosyalarını kaydeder ve SADECE yenileri vektörize eder."""
    pdf_files = [f for f in files if f.filename.lower().endswith(".pdf")]

    if not pdf_files:
        raise HTTPException(status_code=422, detail="Sadece PDF dosyaları kabul edilir.")

    saved_count = 0
    filenames = []

    for file in pdf_files:
        file_path = os.path.join(config.FOLDER_NAME, file.filename)
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        # Sadece bu dosyayı ekle (tümünü yeniden işleme!)
        state["vectordb"] = add_single_pdf(state["vectordb"], file_path)

        saved_count += 1
        filenames.append(file.filename)

    return UploadResponse(
        saved_count=saved_count,
        filenames=filenames,
        message=f"{saved_count} belge sisteme entegre edildi.",
    )

@app.get("/")
def root():
    return {"message": "Kurumsal Mevzuat Asistanı API çalışıyor. Detaylar için /docs adresine bakın."}

class DocumentInfo(BaseModel):
    filename: str
    size_kb: float


@app.get("/api/documents", response_model=List[DocumentInfo])
def get_documents():
    """Sistemde kayıtlı tüm PDF'leri listeler."""
    docs = list_documents()
    return [DocumentInfo(**d) for d in docs]


@app.delete("/api/documents/{filename}")
def delete_document(filename: str):
    """Bir PDF'i sistemden tamamen kaldırır."""
    fpath = os.path.join(config.FOLDER_NAME, filename)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail="Dosya bulunamadı.")

    delete_pdf(state["vectordb"], filename)

    # DB boş kaldıysa None yap
    if state["vectordb"] and state["vectordb"]._collection.count() == 0:
        state["vectordb"] = None

    return {"message": f"{filename} silindi."}