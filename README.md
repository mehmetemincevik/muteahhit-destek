# Müteahhitlik Takip Uygulaması — Backend

NestJS + PostgreSQL + TypeORM ile yazılmış backend API iskeleti.

## Bu İskelette Neler Var?

**Tam çalışan (örnek) modüller:**
- `auth` — kayıt, giriş, JWT token üretimi
- `projects` — proje + arsa + arsa sahibi (hisseli) oluşturma, listeleme
- `units` — blok/daire oluşturma, listeleme, durum güncelleme (satıldı/verildi/boşta)

**Henüz yazılmadı (TODO, aynı desenle eklenecek):**
`payments`, `costs`, `assets`, `cashflow`, `craftsmen`, `messaging`, `templates`
— hepsinin veritabanı şeması `src/database/migrations/` içinde zaten hazır, sadece
NestJS tarafı (entity + dto + service + controller) eklenmeyi bekliyor.

---

## Kurulum (İlk Kez Çalıştırma)

### 1) Gerekli Programlar
- [Node.js LTS](https://nodejs.org/) (20.x veya üzeri)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Postgres'i kolayca çalıştırmak için)

### 2) Bağımlılıkları Kur
```bash
npm install
```

### 3) Veritabanını Ayağa Kaldır
```bash
docker-compose up -d
```
Bu komut, bilgisayarına Postgres kurmadan, arka planda bir Postgres veritabanı başlatır.
Durdurmak istersen: `docker-compose down`

### 4) Ortam Değişkenlerini Ayarla
```bash
cp .env.example .env
```
`.env.example`'daki varsayılan değerler docker-compose ile uyumlu, ilk çalıştırmada
değiştirmene gerek yok. Sadece `JWT_SECRET`'i istersen kendi rastgele metninle değiştir.

### 5) Veritabanı Şemasını Kur (Migration Çalıştır)
```bash
npm run migration:run
```
Bu komut, birlikte tasarladığımız tüm tabloları (`users`, `projects`, `units`,
`payments`, `costs`, ... 8 modülün tamamı) veritabanında oluşturur.

### 6) Sunucuyu Başlat
```bash
npm run start:dev
```
Terminalde `Backend çalışıyor: http://localhost:3000` yazısını görmelisin.
`--watch` modunda çalışır, yani bir dosyayı kaydettiğinde otomatik yeniden başlar.

---

## Hızlı Test (Postman veya curl ile)

### Kayıt Ol
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "contractor",
    "fullName": "Ahmet Yılmaz",
    "phone": "5551234567",
    "password": "sifre123"
  }'
```
Cevapta bir `accessToken` göreceksin — sonraki isteklerde bunu kullanacaksın.

### Giriş Yap
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "5551234567", "password": "sifre123"}'
```

### Proje Oluştur (token gerekli)
```bash
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BURAYA_TOKEN_YAPISTIR" \
  -d '{
    "name": "Yeşiltepe Sitesi",
    "province": "İstanbul",
    "district": "Kadıköy",
    "areaM2": 1200,
    "isKatKarsiligi": true,
    "owners": [
      {"fullName": "Mehmet Arsa Sahibi", "sharePercentage": 60},
      {"fullName": "Ayşe Arsa Sahibi", "sharePercentage": 40}
    ]
  }'
```

---

## Klasör Yapısı Mantığı

```
src/
  main.ts                  -> uygulama giriş noktası
  app.module.ts             -> tüm modüllerin birbirine bağlandığı yer
  database/
    data-source.ts          -> veritabanı bağlantı ayarları
    migrations/              -> şema dosyalarımızın (01-08) TypeORM karşılığı
  common/
    decorators/               -> @CurrentUser() gibi paylaşılan yardımcılar
  modules/
    auth/                       -> HER modül aynı iç yapıyı takip eder:
      dto/                        - dto/        : gelen isteklerin şekli + doğrulama kuralları
      guards/                     - entities/   : veritabanı tablosunun TS karşılığı
      strategies/                 - *.service.ts: iş mantığı (veritabanı işlemleri burada)
      auth.controller.ts          - *.controller.ts: HTTP endpoint tanımları (ince katman)
      auth.module.ts              - *.module.ts : yukarıdakileri birbirine bağlar
    projects/
    units/
    (buraya sırayla payments, costs, assets, cashflow, craftsmen, messaging, templates eklenecek)
```

## Yeni Bir Modül Eklerken İzlenecek Desen

`projects` ve `units` modüllerini örnek al. Örneğin `payments` modülü eklerken:

1. `src/modules/payments/entities/payment.entity.ts` — `02_payments.sql`'deki `payments`
   tablosunu TypeORM entity'sine çevir (units.entity.ts'e bak, aynı desen)
2. `src/modules/payments/dto/create-payment.dto.ts` — hangi alanlar zorunlu/opsiyonel
3. `src/modules/payments/payments.service.ts` — ödeme ekleme, listeleme, bakiye hesaplama
4. `src/modules/payments/payments.controller.ts` — endpoint'ler
5. `src/modules/payments/payments.module.ts` — yukarıdakileri bağla
6. `app.module.ts`'deki `imports` listesine `PaymentsModule`'ü ekle

Bu adımların her birinde birlikte ilerleyebiliriz.
