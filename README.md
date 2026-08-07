<div align="center">

<img src="https://readme-typing-svg.demolab.com/?font=Fraunces&size=32&pause=1000&color=4FD1C5&center=true&vCenter=true&width=600&lines=Mevzuat+Asistan%C4%B1;RAG+ile+Kurumsal+Bilgi+Eri%C5%9Fimi;Azure+OpenAI+%2B+Chroma+%2B+Next.js" alt="Typing SVG" />

# 🏛️ Mevzuat Asistanı

### *Bankacılık mevzuatını okuyun demeyin, sorun.*

Yüklediğiniz kanun ve yönetmelik PDF'lerini vektörleştirip, sorulara **yalnızca o kaynaklara dayanarak**, madde ve sayfa referansı vererek cevap üreten kurumsal RAG asistanı.

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Azure OpenAI](https://img.shields.io/badge/Azure_OpenAI-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)](https://azure.microsoft.com/en-us/products/ai-services/openai-service)
[![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](https://www.langchain.com/)
[![Chroma](https://img.shields.io/badge/ChromaDB-FF6F00?style=for-the-badge&logo=databricks&logoColor=white)](https://www.trychroma.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

<br/>

<img src="https://img.shields.io/github/last-commit/Tahabozkurt/Rag?style=flat-square&color=4FD1C5&label=son%20g%C3%BCncelleme" />
<img src="https://img.shields.io/badge/durum-aktif%20geli%C5%9Ftirme-4FD1C5?style=flat-square" />
<img src="https://img.shields.io/badge/dil-T%C3%BCrk%C3%A7e-4FD1C5?style=flat-square" />

</div>

---

## 🎯 Ne İşe Yarıyor?

Bankacılık, ödeme sistemleri ve operasyon ekipleri her gün onlarca sayfalık mevzuat metninde arama yapmak zorunda kalır. **Mevzuat Asistanı**, bu süreci bir sohbete indirger:

```
📄 PDF yükle  →  🧠 vektörize et  →  ❓ soru sor  →  ✅ madde referanslı cevap al
```

Cevap üretilirken kullanılan her kaynak, **belge adı + sayfa numarası + orijinal metin parçası** ile birlikte gösterilir — "asistan uydurmuyor, gösteriyor" prensibiyle çalışır.

---

## 🏗️ Mimari

<div align="center">

```mermaid
flowchart LR
    A["🖥️ rag-frontend<br/>Next.js · TypeScript"] -- HTTP --> B["⚙️ rag-backend<br/>FastAPI"]
    B -- embed & retrieve --> C[("🗂️ ChromaDB<br/>kalıcı vektör deposu")]
    B -- prompt --> D["☁️ Azure OpenAI<br/>Kimi-K2.6"]
    D -- cevap --> B
    B -- JSON --> A

    style A fill:#10151f,stroke:#4FD1C5,color:#e7ebf3
    style B fill:#10151f,stroke:#4FD1C5,color:#e7ebf3
    style C fill:#10151f,stroke:#2b7a72,color:#e7ebf3
    style D fill:#10151f,stroke:#2b7a72,color:#e7ebf3
```

</div>

Yeni bir PDF yüklendiğinde **yalnızca o dosya** parçalanıp vektörleştirilir — tüm veritabanı sıfırdan kurulmaz, kalıcı Chroma deposuna eklenir.

---

## ✨ Özellikler

| | |
|---|---|
| 🧩 **Kaynak Gösterimi** | Her cevabın altında hangi belge, hangi sayfa, hangi metin parçası kullanıldığı açılır listede görünür |
| 📤 **Sürükle-Bırak Yükleme** | PDF'leri panelde sürükleyip bırakmanız yeterli, kalan işi vektörizasyon hattı halleder |
| ⚡ **Artımlı (Incremental) İşleme** | Yeni PDF eklendiğinde tüm kütüphane değil, yalnızca yeni belge işlenir |
| 💬 **Bağlamlı Sohbet** | Son mesajlar dikkate alınarak takip sorularına da tutarlı cevap üretilir |
| 🌓 **Açık / Koyu Tema** | Göz yorgunluğuna göre arayüz teması anında değiştirilebilir |
| 🚫 **Uydurmama Garantisi** | Cevap, sağlanan mevzuat metninde yoksa asistan bunu açıkça belirtir |

---

## 🛠️ Teknoloji Yığını

<table>
<tr>
<td valign="top" width="50%">

**Frontend**
| Katman | Teknoloji |
|---|---|
| Framework | `Next.js 15 (App Router)` |
| Dil | `TypeScript` |
| Stil | `Custom CSS` (Fraunces + Source Sans) |
| Durum | `React Hooks` |

</td>
<td valign="top" width="50%">

**Backend**
| Katman | Teknoloji |
|---|---|
| API | `FastAPI` + `Uvicorn` |
| RAG Orkestrasyon | `LangChain` |
| Embedding | `intfloat/multilingual-e5-base` |
| Vektör DB | `ChromaDB` (kalıcı) |
| LLM | `Azure OpenAI (Kimi-K2.6)` |

</td>
</tr>
</table>

---

## 📦 Hızlı Kurulum

Projeyi yerelinizde ayağa kaldırmak birkaç dakikanızı alır:

**1. Repoyu klonlayın**

```bash
git clone https://github.com/Tahabozkurt/Rag.git
cd Rag
```

**2. Backend'i çalıştırın**

```bash
cd rag-backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

`.env` dosyanızı oluşturun:

```env
AZURE_OPENAI_API_KEY=your_key
AZURE_OPENAI_ENDPOINT=your_endpoint
AZURE_OPENAI_API_VERSION=2024-02-01
AZURE_DEPLOYMENT_NAME=Kimi-K2.6
```

```bash
uvicorn api:app --reload --port 8000
```

**3. Frontend'i çalıştırın**

```bash
cd rag-frontend
npm install
```

`.env.local` dosyanızı oluşturun:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev
```

**4. Açın** → [http://localhost:3000](http://localhost:3000) 🎉

> Detaylı API dokümantasyonu için backend çalışırken `http://localhost:8000/docs` adresini ziyaret edin.

---

## 📁 Klasör Yapısı

```
Rag/
├── rag-backend/          ⚙️  FastAPI + RAG mantığı
│   ├── api.py               REST API katmanı
│   ├── database.py          Chroma vektör işlemleri
│   ├── llm_service.py       Azure OpenAI entegrasyonu
│   ├── document_manager.py  PDF yükleme & kayıt
│   └── app.py                (opsiyonel) Streamlit arayüzü
│
└── rag-frontend/          🖥️  Next.js sohbet arayüzü
    ├── app/                   Sayfalar & API istemcisi
    ├── components/            Sohbet, yükleme, kaynak bileşenleri
    └── lib/                    Tipler & yerel depolama
```

---

## 🔒 Güvenlik

`rag-backend/.env` ve `rag-frontend/.env.local` dosyaları `.gitignore` ile korunur, repoya asla girmez. API anahtarlarınızı hiçbir zaman doğrudan koda yazmayın.

---

## 👨‍💻 Geliştirici

<div align="center">

**Taha Bozkurt**

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Tahabozkurt)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/taha-bozkurt/)

<sub>Mevzuat Asistanı, bir **Taha Bozkurt** projesidir · © 2026</sub>

</div>
