# Müteahhitlik Takip — Backend API

Müteahhitlerin proje, daire, tahsilat, maliyet ve nakit akışı süreçlerini yönettiği
uygulamanın sunucu tarafı.

**Stack:** NestJS 10 · TypeScript · PostgreSQL 16 · TypeORM · Passport (JWT)

---

## Modüller

| Modül | Kapsam |
|---|---|
| `auth` | Kayıt, giriş, JWT üretimi ve doğrulaması |
| `projects` | Proje, arsa, hisseli arsa sahipleri, açık ilan yönetimi |
| `units` | Blok, daire, alıcı; daire durum yönetimi |
| `payments` | Daire tahsilatları, kalan bakiye |
| `costs` | Maliyet kategorileri, kalemler, kısmi ödemeler |
| `assets` | Nakit/emtia/mülk varlıkları, kira, merkezi hareket defteri |
| `cashflow` | Vadeli gelir-gider takvimi, gecikme faizi tahakkuku |
| `craftsmen` | Usta profili, hizmet paketleri, portfolyo, değerlendirmeler, proje atamaları |
| `messaging` | Proje bağlamlı konuşmalar, teklif ve karşı teklif akışı |
| `templates` | Hazır hizmet paketi şablonları (salt okunur) |
| `notifications` | Okunmamış mesaj, bekleyen teklif ve gecikmiş kayıt sayaçları |

---

## Kurulum

**Gereksinimler:** Node.js LTS, Docker (veya yerel PostgreSQL 16).

```bash
npm install
docker compose up -d          # postgres:16, port 5432
cp .env.example .env
npm run migration:run
npm run start:dev             # http://localhost:3000
```

### Ortam değişkenleri

| Değişken | Açıklama |
|---|---|
| `DB_HOST` · `DB_PORT` · `DB_USERNAME` · `DB_PASSWORD` · `DB_NAME` | Veritabanı bağlantısı |
| `JWT_SECRET` | Token imzalama anahtarı |
| `JWT_EXPIRES_IN` | Token ömrü (varsayılan `7d`) |
| `SYSTEM_API_KEY` | Sistem uçlarının `X-API-Key` doğrulaması |
| `PORT` | Uygulama portu (varsayılan 3000) |
| `UPLOAD_DIR` | Yüklenen dosyaların klasörü (varsayılan `uploads`) |
| `PUBLIC_BASE_URL` | Dosya erişim adresi; mobil cihazın ulaşabildiği adres olmalı |

`JWT_SECRET` ve `SYSTEM_API_KEY` üretimde mutlaka değiştirilmeli.

---

## Mimari

```
src/
  main.ts                   Global ValidationPipe, CORS
  app.module.ts             Modül kayıtları, TypeORM, throttler, scheduler
  database/
    data-source.ts          TypeORM CLI yapılandırması
    migrations/             Şema geçmişi
  common/
    decorators/             @CurrentUser, @Roles
    guards/                 RolesGuard, ApiKeyGuard
  modules/<modül>/
    entities/               Tablo tanımları
    dto/                    İstek şemaları ve doğrulama
    *.service.ts            İş mantığı, yetki doğrulaması
    *.controller.ts         Uç tanımları
    *.module.ts             Bağımlılıklar
```

Her modül aynı yapıyı izler. Yeni modül eklerken mevcut bir modül (`payments` en sade
örnek) şablon olarak alınabilir; modülün `app.module.ts` içinde kaydedilmesi gerekir.

### Yetkilendirme

İki ayrı mekanizma vardır:

- **Kullanıcı uçları:** `JwtAuthGuard` + `RolesGuard`. Rol kısıtı `@Roles('contractor')`
  ile açıkça belirtilir; işaretlenmemiş uçlarda rol kontrolü uygulanmaz.
- **Sistem uçları (`/system/*`):** `ApiKeyGuard`, `X-API-Key` header'ı bekler. Kullanıcı
  oturumu geçerli değildir.

Kaynak sahipliği servis katmanında doğrulanır. Proje sahipliği için
`ProjectsService.findOneForContractor` ortak giriş noktasıdır; daire, maliyet ve ödeme
servisleri sahipliği bu zincir üzerinden çözer. Alıcı ve arsa sahibi kayıtları da
kullanılmadan önce hesap bazında doğrulanır.

### Şema yönetimi

`synchronize` kapalıdır. Şema değişiklikleri yalnızca migration ile yapılır; SQL
karşılıkları `schema/` klasöründe tutulur ve migration dosyaları bu SQL'i uygular.

```bash
npm run migration:run       # bekleyen migration'ları uygula
npm run migration:show      # durum
npm run migration:revert    # son migration'ı geri al
```

Migration'ların `down()` metotları yazılmadı; geri alma elle yapılmalıdır.

### Transaction kullanımı

Birden fazla tabloya yazan işlemler tek transaction içinde yürütülür; ara adımlardan
biri başarısız olursa tamamı geri alınır:

| İşlem | Birlikte yazılanlar |
|---|---|
| Proje oluşturma | `projects` + `land` + `land_owners` |
| Daire tahsilatı | `payments` + `asset_transactions` |
| Maliyet ödemesi | `cost_payments` + `asset_transactions` |
| Varlık hareketi | `asset_transactions` + `assets.current_value` |
| Değerleme kaydı | `asset_value_snapshots` + `assets.current_value` |
| Kira tahsilatı | `rental_payments` + `asset_transactions` |
| Takvim kaydı kapatma | ilgili gerçekleşen kayıt + `cashflow_calendar.status` |
| Faiz tahakkuku | `cashflow_interest_accruals` + `cashflow_calendar.current_amount` |

Başka bir işlemin parçası olarak çağrılabilen servis metotları (`PaymentsService.create`,
`AssetsService.addRentalPayment`) son parametre olarak `EntityManager` alır. Değer
verildiğinde çağıranın transaction'ı kullanılır, verilmediğinde metot kendi
transaction'ını açar. `CashflowService.markAsPaid` bu mekanizmayla üç farklı yolu tek
işlem altında toplar.

### Dosya yükleme

Görseller `multipart/form-data` ile alınır, `StorageService` tarafından diske yazılır ve
erişim adresi ilgili kayda işlenir. Dosyalar `/uploads` altından statik olarak sunulur.

- Kabul edilen biçimler: JPEG, PNG, WEBP, HEIC. Kontrol hem MIME tipine hem uzantıya bakar.
- Boyut sınırı 8 MB; istek gövdesi seviyesinde ve servis içinde ayrı ayrı denetlenir.
- Dosya adı sunucuda UUID ile üretilir; istemciden gelen ad kullanılmaz.
- Kayıt oluşturulamazsa yazılan dosya silinir, kayıt silinirse dosya da temizlenir.

`PUBLIC_BASE_URL` mobil cihazın erişebildiği adres olmalıdır; `localhost` bırakılırsa
üretilen adresler cihazdan açılamaz.

### Hesaplanan değerler

Bakiye ve toplam gibi türetilmiş değerler kolonda tutulmaz, view'lardan okunur:

| View | Kullanım |
|---|---|
| `unit_payment_summary` | Daire tahsilat bakiyesi |
| `cost_item_payment_summary` | Maliyet kalemi ödeme durumu |
| `project_cost_summary` | Proje maliyetlerinin kategori bazında toplamı |
| `public_project_listings` | Ustalara açık proje ilanları (finansal alanlar hariç) |

View'lar repository ile eşlenmez; parametreli ham sorgu ile okunur. Dönen alanlar
snake_case, sayısal değerler string'dir.

İstisna: `assets.current_value` ve `craftsman_profiles.average_rating` performans
nedeniyle kolonda tutulur ve ilgili servis tarafından yeniden hesaplanır.

---

## Zamanlanmış işler

Gecikme faizi tahakkuku her gün 00:05'te çalışır (`CashflowService.handleDailyAccrualCron`).
Aynı işlem manuel olarak da tetiklenebilir:

```
POST /system/cashflow/run-daily-accrual
X-API-Key: <SYSTEM_API_KEY>
```

Faiz basit faizdir ve anapara üzerinden hesaplanır. Mükerrer tahakkuk
`(calendar_entry_id, accrual_date)` benzersiz kısıtıyla engellenir; iş aynı gün içinde
birden çok kez çalıştırılabilir.

---

## Bilinen sınırlamalar

- **Token yenileme yok.** Süresi dolan token için yeniden giriş gerekir. Rol bilgisi
  token içinden okunduğundan, rol değişikliği eski token süresi dolana kadar yansımaz.
- **Hız sınırı ve zamanlayıcı tek instance varsayar.** Throttler sayacı bellekte tutulur;
  zamanlanmış iş her instance'ta tetiklenir. Yatay ölçekleme için ortak store ve kilit gerekir.
- **Maliyet kategorileri hesaplar arasında ortak.** `cost_categories` tablosunda
  `contractor_id` yok.
- **`asset_transactions` referansları polimorfik.** `sourceTable` + `sourceId` çifti
  foreign key ile korunmuyor; kaynak kayıt silinirse defter satırı bağlantısız kalır.
- **Değerlendirme doğrulaması kısmi.** `projectId` gönderilmezse ustayla çalışılmış olma
  koşulu kontrol edilmiyor.
- **CORS tüm kaynaklara açık.** Üretimde kısıtlanmalı.
- **Yüklenen dosyalar yerel diskte.** Tek sunuculu kurulum varsayılır; birden fazla
  instance çalıştırıldığında dosyalar örnekler arasında paylaşılmaz. Ortak depolamaya
  (S3 / R2 / MinIO) geçiş `StorageService` içinde yapılabilir.
- **Yüklenen dosyalar kimlik doğrulaması olmadan erişilebilir.** Adresler rastgele UUID
  içerdiği için tahmin edilemez, ancak adresi bilen herkes görüntüleyebilir.

## Uçlar

Route listesi uygulama başlatıldığında `RouterExplorer` günlüklerinde görülebilir.
API dokümantasyonu (Swagger) henüz eklenmedi.
