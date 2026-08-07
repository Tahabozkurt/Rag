# Mevzuat Asistanı (RAG)

Bankacılık servisleri ve operasyonel yönergeler için kurumsal mevzuat asistanı. Yüklenen PDF mevzuat metinlerini vektörleştirir, kullanıcı sorularına yalnızca bu kaynaklara dayanarak, madde ve sayfa referanslarıyla birlikte cevap üretir.

## Mimari

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────┐
│   rag-frontend    │  HTTP  │    rag-backend      │        │   Azure OpenAI     │
│   (Next.js)         │ ─────▶ │   (FastAPI)           │ ─────▶ │   (Kimi-K2.6)        │
│   localhost:3000  │        │   localhost:8000    │        │                       │
└─────────────────┘        └──────────────────┘        └─────────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │   Chroma (kalıcı)   │
                              │   vektör veritabanı   │
                              └──────────────────┘
```

- **rag-backend** — FastAPI servisi. PDF'leri okur, parçalar, `intfloat/multilingual-e5-base` ile embed eder, Chroma'da kalıcı olarak saklar (yeni PDF eklendiğinde sadece o dosya işlenir, tüm veritabanı yeniden kurulmaz). Sorulara, en alakalı metin parçalarını bulup Azure OpenAI ile cevap üretir. Ayrıca Streamlit tabanlı eski arayüz (`app.py`) de aynı klasörde durur, isteğe bağlı çalıştırılabilir.
- **rag-frontend** — Next.js tabanlı sohbet arayüzü. Sorular sorar, cevapları ve kaynak referanslarını gösterir, PDF yükleme ve kaynak arşivi yönetimi sağlar.

## Kurulum

### 1. Backend

```bash
cd rag-backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

`.env` dosyası oluştur (bkz. `.env.example`):

```
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=...
AZURE_OPENAI_API_VERSION=2024-02-01
AZURE_DEPLOYMENT_NAME=Kimi-K2.6
```

Çalıştır:

```bash
uvicorn api:app --reload --port 8000
```

API dokümantasyonu: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend

```bash
cd rag-frontend
npm install
```

`.env.local` dosyası oluştur:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Çalıştır:

```bash
npm run dev
```

Arayüz: [http://localhost:3000](http://localhost:3000)

## Kullanım

1. Arayüzü aç, sol panelden PDF mevzuat belgelerini yükle ("Sisteme Entegre Et").
2. Yükleme tamamlanınca sohbet kutusuna sorunu yaz.
3. Cevabın altında "Kaynaklar" bölümünden hangi belge ve sayfadan alıntı yapıldığını gör.

## Güvenlik notu

`rag-backend/.env` ve `rag-frontend/.env.local` dosyaları `.gitignore` ile hariç tutulmuştur, repoya girmez. API anahtarlarını hiçbir zaman doğrudan kod içine yazmayın.

## Klasör yapısı

```
Rag/
  rag-backend/     FastAPI + RAG mantığı (bkz. rag-backend/README.md)
  rag-frontend/     Next.js arayüzü (bkz. rag-frontend/README.md)
```
