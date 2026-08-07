# Dosya Adı: config.py
import os
from dotenv import load_dotenv

load_dotenv()  # .env dosyasını yükler

# --- SİSTEM AYARLARI ---
FOLDER_NAME = "mevzuat_kaynaklari"

# --- AZURE OPENAI AYARLARI ---
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01")
AZURE_DEPLOYMENT_NAME = os.getenv("AZURE_DEPLOYMENT_NAME", "Kimi-K2.6")

if not AZURE_OPENAI_API_KEY or not AZURE_OPENAI_ENDPOINT:
    raise ValueError(
        "AZURE_OPENAI_API_KEY veya AZURE_OPENAI_ENDPOINT bulunamadı. "
        ".env dosyasını kontrol et (bkz: .env.example)."
    )

# --- RAG (VEKTÖR) AYARLARI ---
EMBEDDING_MODEL = "intfloat/multilingual-e5-base"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
SEARCH_K = 8
LLM_TEMPERATURE = 0

if not os.path.exists(FOLDER_NAME):
    os.makedirs(FOLDER_NAME)
    
# --- KALICI DEPOLAMA ---
CHROMA_PERSIST_DIR = "chroma_db"
DOCUMENT_REGISTRY = "document_registry.json"

if not os.path.exists(CHROMA_PERSIST_DIR):
    os.makedirs(CHROMA_PERSIST_DIR)