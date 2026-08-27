# Müteahhitlik Takip — Mobil İstemci

Müteahhitlerin proje, daire, tahsilat ve nakit akışı süreçlerini tek yerden yönettiği
uygulamanın mobil tarafı. NestJS backend'ine REST üzerinden bağlanır.

**Stack:** Expo (SDK 57) · React Native 0.86 · TypeScript · React Navigation · Axios

---

## Kapsam

Uygulanan akışlar:

| Alan | Ekranlar |
|---|---|
| Kimlik | Kayıt (müteahhit / usta rolü), giriş, kalıcı oturum |
| Projeler | Liste, oluşturma, detay |
| Daireler | Blok ve daire ekleme, kat kesiti görünümü, durum yönetimi |
| Alıcılar | Kayıt, listeleme, daireye atama (satış) |
| Tahsilat | Daire bazlı ödeme kaydı, kalan bakiye, tahsilat oranı |
| Maliyetler | Kategori ve kalem yönetimi, sabit/değişken dağılımı, kısmi ödeme |
| Nakit akışı | Çek/taksit/kira takvimi, gecikme faizi takibi, faiz tahakkuk geçmişi |

Backend'de hazır olup mobil karşılığı henüz yazılmamış modüller: varlıklar (nakit, mülk,
kira), usta profili ve hizmet paketleri, teklif/mesajlaşma.

---

## Kurulum

**Gereksinimler:** Node.js LTS, çalışır durumda backend, cihazda Expo Go.

```bash
npm install
```

### API adresi

`src/api/client.ts` içindeki `API_BASE_URL`, backend'in çalıştığı makinenin yerel ağ
IP'sini göstermelidir:

```ts
const API_BASE_URL = 'http://192.168.1.34:3000';
```

`localhost` çalışmaz: uygulama cihazda, backend ayrı bir makinede koşar. IP `ipconfig`
(Windows) veya `ifconfig` (macOS/Linux) ile bulunur. Cihaz ile sunucunun aynı ağda olması
ve 3000 portunun güvenlik duvarında açık olması gerekir.

> Bu değer şu an kaynak kodda sabit. Ortam değişkenine taşınması bekleyen bir iş
> (`src/api/client.ts` içindeki TODO).

### Çalıştırma

```bash
npx expo start
```

Çıkan QR kod Expo Go ile okutulur (iOS'ta kamera uygulaması da yönlendirir).

---

## Mimari

```
App.tsx                     Font yüklemesi, AuthProvider, navigasyon kökü
src/
  api/                      Backend uçlarının tek sarmalayıcısı
    client.ts               Axios örneği, token interceptor'ı
    auth.ts · projects.ts · units.ts · payments.ts · costs.ts · cashflow.ts
  context/
    AuthContext.tsx         Oturum durumu, AsyncStorage kalıcılığı
  navigation/
    AppNavigator.tsx        Oturuma göre koşullu yığın
  components/               Button, TextField, StatusBadge
  screens/                  Ekranlar
  theme/
    tokens.ts               Renk, boşluk, tipografi token'ları
  types/                    Backend DTO'larının TypeScript karşılıkları
  utils/
    format.ts               Para, tarih, sayı ayrıştırma
```

**Katman kuralları**

- Ekranlar `api/` katmanını çağırır; doğrudan `axios` kullanmaz.
- Renk ve ölçü değerleri `theme/tokens.ts` dışından okunmaz; ham hex kodu yazılmaz.
- Sunucudan dönen `numeric` alanlar string'dir (`"300000.00"`). Gösterimden önce
  `utils/format.ts` üzerinden geçirilir, hesaplamadan önce `parseFloat` uygulanır.
- Liste ekranları `useFocusEffect` ile veri çeker; böylece bir kayıt oluşturup geri
  dönüldüğünde liste güncel olur.

## Yeni ekran ekleme

1. `src/types/` altına backend DTO'suna karşılık gelen tipi ekle.
2. `src/api/` altına ilgili çağrıları yaz.
3. `src/screens/` altında ekranı oluştur (yükleniyor ve hata durumları dahil).
4. `src/navigation/AppNavigator.tsx` içindeki oturum açık yığınına kaydet.

---

## Bilinen sınırlamalar

- **Token yenileme yok.** Backend token'ı 7 gün geçerli; süre dolduğunda istekler 401
  döner ve hata olarak görünür. Otomatik oturum düşürme eklenmedi.
- **Tarih girişleri metin alanı.** `YYYY-AA-GG` biçimi elle yazılıyor, tarih seçici yok.
- **"Arsa sahibine verildi" durumu eksik.** Backend `landOwnerId` bekliyor; arsa
  sahiplerini listeleyip seçtiren ekran henüz yazılmadı.
- **Boş katlar çizilmiyor.** Kat kesiti yalnızca içinde daire bulunan katları gösterir.
- **Maliyet kategorileri ortak.** Backend'de kategoriler kullanıcıya bağlı değil; bir
  kullanıcının eklediği kategori diğerlerine de görünür.

## Sorun giderme

**`AsyncStorageError: Native module is null`**
`@react-native-async-storage/async-storage` 3.x sürümleri Expo SDK 54+ ile uyumsuz.
Sürüm `2.2.0` olarak sabitlendi, yükseltilmemeli.

```bash
npm install @react-native-async-storage/async-storage@2.2.0
npx expo start --clear
```

**`Project is incompatible with this version of Expo Go`**
Expo Go tek bir SDK sürümü içerir ve mağaza sürümü projenin gerisinde kalabilir.
`expo.dev/go` üzerinden `package.json`'daki `expo` sürümüne karşılık gelen derleme kurulur.

**`Network Error`**
`API_BASE_URL`, backend'in çalışır durumda olması ve ağ/güvenlik duvarı ayarları kontrol
edilir.

**Paket sürümleri tutarsızsa**

```bash
npx expo install --fix
```
