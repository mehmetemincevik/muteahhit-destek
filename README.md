# Müteahhitlik Takip

Müteahhitlerin bir inşaat projesini arsa tesliminden iskana kadar tek yerden yönettiği
uygulama. Proje maliyetleri, daire satışları, tahsilatlar, vadeli ödemeler ve taşeron
ilişkileri aynı sistemde takip edilir.

**Durum:** Geliştirme aşamasında. Backend modüllerinin tamamı yazıldı, mobil istemcide
akışların bir kısmı tamamlandı (bkz. [Yol haritası](#yol-haritası)).

```
muteahhit-app/
├── backend/     NestJS + PostgreSQL API
├── mobile/      Expo (React Native) istemci
└── schema/      Veritabanı şemasının SQL kaynağı
```

---

## Problem

Müteahhitlik işi, birbirine bağlı ama pratikte dağınık tutulan verilerden oluşur:

- Bir dairenin satış fiyatı, ne kadarının tahsil edildiği, kalan bakiyesi
- Arsa sahibine kat karşılığı verilen daireler, üzerine ödenen veya alınan farklar
- Beton, demir, işçilik gibi kalemlerin proje maliyetine katkısı ve ödeme durumu
- Vadesi gelen çekler, geciken ödemelerde işleyen faiz
- Hangi taşeronun hangi işi hangi bedelle üstlendiği

Bu bilgiler genelde ayrı Excel dosyalarında, defterlerde ve telefon konuşmalarında
dağılır. Sonuç: projenin gerçek maliyeti ve nakit durumu ancak dönem sonunda,
elle toplanarak anlaşılır.

Bu uygulama, bu verileri tek bir veri modelinde birleştirir. Bir daireye ödeme
girildiğinde bakiye, proje tahsilat oranı ve genel defter aynı anda güncellenir.

---

## Kapsam

### Proje ve daire yönetimi

Proje, arsa ve hisseli arsa sahipleri tek kayıtta tutulur. Bloklar ve daireler bina
kesiti düzeninde görüntülenir: her satır bir kat, her hücre bir daire, renk kodu
dairenin durumunu (boşta / satıldı / arsa sahibine verildi) gösterir.

### Tahsilat

Topraktan satışta ödeme parça parça alınır. Her tahsilat ayrı kayıttır; kalan bakiye
ve tahsilat oranı bu kayıtlardan hesaplanır, ayrı bir alanda tutulmaz.

### Maliyet takibi

Maliyetler sabit (arsa bedeli, harç) ve değişken (beton, demir) olarak ayrılır. Her
kalem kısmi ödenebilir; kaleme yapılan ödemeler ayrı ayrı izlenir, kalan borç görünür.
Proje geneli kategori bazında toplanır.

### Nakit akışı ve gecikme faizi

Çek, taksit ve kira gibi vadeli hareketler takvimde tutulur. Vadesi geçen ve faiz oranı
tanımlı kayıtlara her gün otomatik faiz işler. Faiz basit faizdir ve anapara üzerinden
hesaplanır. Her günün tahakkuku ayrı kayıt olarak saklanır ve silinmez; tutarın nasıl
oluştuğu adım adım izlenebilir.

Bir takvim kaydı ödendi işaretlendiğinde, türüne göre gerçek bir tahsilat, kira geliri
veya defter kaydına dönüşür.

### Varlıklar

Aktif inşaat dışındaki nakit, emtia ve mülkler ayrı tutulur. Nakit bakiyesi hareket
toplamından, mülk değeri en güncel değerleme kaydından gelir. Kira geliri deftere yazılır
ancak mülkün değerini değiştirmez.

### Taşeron ilişkileri

Ustalar hizmet paketleri tanımlar (örneğin su, doğalgaz ve elektrik tesisatını tek
pakette veren firmalar için). Müteahhit ustaları arar, proje bağlamında konuşma açar,
teklif alışverişi yapar. Kabul edilen teklif otomatik olarak proje-usta ataması
oluşturur. İş bittiğinde müteahhit ustayı değerlendirir.

---

## Kurulum

Backend ve mobil istemci ayrı ayrı kurulur. Her ikisinin kendi README'si vardır:

- [`backend/README.md`](backend/README.md) — API kurulumu, ortam değişkenleri, migration
- [`mobile/README.md`](mobile/README.md) — istemci kurulumu, API adresi ayarı

Kısaca:

```bash
# API
cd backend
npm install
docker compose up -d
cp .env.example .env
npm run migration:run
npm run start:dev

# İstemci (ayrı terminalde)
cd mobile
npm install
# src/api/client.ts içindeki API_BASE_URL, makinenin yerel ağ IP'sine ayarlanır
npx expo start
```

Mobil uygulama cihazda çalıştığı için `localhost` üzerinden API'ye erişemez; cihaz ile
sunucunun aynı ağda olması gerekir.

---

## Teknik yapı

| Katman | Seçim |
|---|---|
| API | NestJS 10, TypeScript |
| Veritabanı | PostgreSQL 16, TypeORM |
| Kimlik doğrulama | JWT (Passport), rol bazlı yetkilendirme |
| İstemci | Expo SDK 57, React Native, TypeScript |
| Navigasyon | React Navigation (native stack) |

### Veri modeli üzerine notlar

**Türetilmiş değerler kolonda tutulmaz.** Bakiye, toplam ve tahsilat oranı gibi değerler
view'lardan okunur. Böylece bir ödeme silindiğinde veya düzeltildiğinde tutarlar
kendiliğinden doğru kalır. İstisna, performans nedeniyle önbelleklenen iki alan vardır
(varlık güncel değeri, usta ortalama puanı); bunlar ilgili işlemden sonra yeniden hesaplanır.

**Birden fazla tabloya yazan işlemler transaction içinde yürütülür.** Bir tahsilat
kaydedildiğinde hem ilgili ödeme tablosuna hem de merkezi deftere yazılır; ikisi tek
işlem olarak ele alınır ve biri başarısız olursa diğeri de geri alınır. Aksi halde
tahsilat görünürken defterde yer almayan tutarlar oluşur. Ayrıntı için
`backend/README.md`.

**Şema değişiklikleri yalnızca migration ile yapılır.** TypeORM'un `synchronize` özelliği
kapalıdır; elle yazılmış CHECK constraint'leri ve view'ları bozmaması için. SQL kaynağı
`schema/` klasöründe, uygulanan sürüm `backend/src/database/migrations/` altındadır.

**Planlanan ile gerçekleşen ayrılır.** Nakit akışı takvimi beklenen hareketleri tutar;
gerçekleşen para hareketi ayrı tablolara yazılır. Bu ayrım olmadan "bu ay ne bekliyorum"
ile "bu ay ne oldu" sorularının cevabı karışır.

---

## Yol haritası

### Tamamlandı

- Backend: kimlik doğrulama, projeler, daireler, alıcılar, tahsilat, maliyetler,
  varlıklar, nakit akışı, ustalar, mesajlaşma ve teklifler, hizmet paketi şablonları
- Rol bazlı yetkilendirme, hız sınırlama, sistem uçları için API anahtarı
- Foreign key indeksleri
- Mobil: tüm backend modüllerinin karşılığı (kimlik doğrulama, projeler, daireler,
  alıcılar, tahsilat, maliyetler, nakit akışı, varlıklar, usta profili, teklif süreci,
  arsa sahibi devri)

### Sıradaki

- Push bildirim (uygulama kapalıyken; development build gerektiriyor)

### Sonraki fazlar

- **TCMB EVDS entegrasyonu** — Konut Fiyat Endeksi üzerinden daire ve mülk değerlerinin
  tahmini projeksiyonu. Altyapı hazır (`unit_value_snapshots`, `asset_value_snapshots`),
  veri kaynağı bağlanmadı.
- **Excel dışa aktarım** — n8n üzerinden otomasyon.
- **Proje dosyası okuma** — mimari projeden (DWG) duvar, cam, sıva metrajı; statik
  projeden beton ve demir miktarı çıkarımı. Şu an bu veriler manuel giriliyor. CAD
  dosyalarından güvenilir metraj çıkarmak kendi başına bir mühendislik problemi olduğu
  için bilinçli olarak ertelendi.
- **Arsa maliyeti sorgulama** — yol katılım payı gibi kalemler için resmi kaynaklardan
  veri çekme. Kamu sistemlerinin açık API'si bulunmadığından şimdilik manuel giriş.

---

## Bilinen sınırlamalar

Her iki tarafın da kendi README'sinde ayrıntılı listesi var. Öne çıkanlar:

- Token yenileme mekanizması yok; süresi dolan oturumda yeniden giriş gerekir.
- Hız sınırlama sayacı ve zamanlanmış iş tek instance varsayar. Yatay ölçekleme için
  ortak store ve dağıtık kilit gerekir.
- Maliyet kategorileri hesaplar arasında ortak.
- API dokümantasyonu (Swagger) eklenmedi.
