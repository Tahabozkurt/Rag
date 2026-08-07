# Mevzuat Asistanı — Frontend

Kurumsal mevzuat ve bankacılık yönergeleri için RAG (Retrieval-Augmented Generation) tabanlı sohbet arayüzü. Next.js (App Router) ile geliştirildi, backend'deki FastAPI servisine bağlanır.

## Özellikler

- Sohbet geçmişi ile soru-cevap arayüzü
- Her cevapla birlikte kaynak/madde referansı gösterimi (dosya adı + sayfa numarası)
- Sürükle-bırak PDF yükleme ve kaynak arşivi listesi
- Sistem durumu göstergesi (vektör veritabanı hazır mı, hangi model aktif)
- Açık/koyu tema

## Kurulum

```bash
npm install
```

## Ortam değişkenleri

Kök dizinde `.env.local` dosyası oluştur:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Bu, backend'in (bkz. `../rag-backend`) çalıştığı adresi gösterir. Backend farklı bir portta veya sunucuda çalışıyorsa buna göre güncelle.

## Geliştirme sunucusunu çalıştır

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresini aç. Backend'in de ayrı bir terminalde çalışıyor olması gerekir (bkz. `../rag-backend/README.md`).

## Proje yapısı

```
app/
  page.tsx            Ana sohbet sayfası
  api-client.ts        Backend API çağrılarını yöneten merkezi katman
  globals.css           Genel stiller ve tema değişkenleri
components/
  ChatArea.tsx          Mesaj listesi ve scroll yönetimi
  ChatInput.tsx          Soru yazma alanı
  ChatMessage.tsx        Tekil mesaj balonu
  SourcesAccordion.tsx   Açılır kaynak/madde referans listesi
  Sidebar.tsx             Sol panel (kaynak yönetimi, sistem durumu)
  FileUpload.tsx          PDF sürükle-bırak yükleme
  DocumentList.tsx        Yüklenmiş kaynakların listesi
  StatusBadge.tsx         Sistem durumu göstergesi
  ThemeToggle.tsx         Açık/koyu tema geçişi
  TypingIndicator.tsx     Cevap üretilirken gösterilen animasyon
lib/
  types.ts               Paylaşılan TypeScript tipleri
  storage.ts              Yerel depolama yardımcıları
```

## Backend bağlantısı

Bu arayüz, `../rag-backend` altındaki FastAPI servisinin şu endpoint'lerini kullanır:

| Method | Path | Amaç |
|---|---|---|
| GET | `/api/status` | Sistemin hazır olup olmadığını ve aktif modeli döner |
| POST | `/api/chat` | Soruyu gönderir, cevap ve kaynakları alır |
| POST | `/api/upload` | PDF yükler, vektör veritabanına ekler |

Detaylı API dokümantasyonu için backend çalışırken `http://localhost:8000/docs` adresine bakılabilir.
