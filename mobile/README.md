# Müteahhitlik Takip Uygulaması — Mobil (Expo / React Native)

Backend'e bağlanan, Expo ile yazılmış mobil uygulama iskeleti.

## Bu İskelette Neler Var?

**Tam çalışan (örnek) akış:**
- Kayıt ol / Giriş yap (rol seçimi: müteahhit / usta)
- Oturum, telefonda kalıcı olarak saklanıyor (uygulamayı kapatıp açsan bile giriş yapmış kalıyorsun)
- Proje listesi görüntüleme + yeni proje oluşturma

**Henüz yazılmadı (TODO, aynı desenle eklenecek):**
Daireler, ödemeler, maliyetler, varlıklar, takvim, ustalar, mesajlaşma ekranları —
backend'in tüm bu modülleri zaten hazır, sadece mobil tarafı (ekran + API çağrısı) eklenmeyi bekliyor.

---

## Kurulum (İlk Kez Çalıştırma)

### 1) Gerekli Programlar
- [Node.js LTS](https://nodejs.org/) (zaten backend için kurmuştun)
- Telefonuna **Expo Go** uygulamasını kur (App Store / Play Store'dan ara)

### 2) Bağımlılıkları Kur
```bash
npm install
```

### 3) Backend Adresini Ayarla (ÇOK ÖNEMLİ)
`src/api/client.ts` dosyasını aç, şu satırı bul:
```typescript
const API_BASE_URL = 'http://BURAYA_PC_IP_ADRESIN:3000';
```

`BURAYA_PC_IP_ADRESIN` yazan yeri, **bilgisayarının yerel ağ IP'siyle** değiştir.//
Bulmak için PowerShell'de:
```
ipconfig
```
"IPv4 Address" satırındaki değeri kullan (örn. `192.168.1.34`). Sonuç şöyle olmalı:
```typescript
const API_BASE_URL = 'http://192.168.1.34:3000';
```

**Neden `localhost` değil?** Çünkü telefon ve bilgisayarın FİZİKSEL OLARAK farklı cihazlar.
`localhost` yazarsan, telefon kendi içinde arar, bilgisayarındaki backend'i asla bulamaz.

**Ayrıca:**
- Telefon ve bilgisayar **aynı WiFi ağında** olmalı
- Backend'in (`npm run start:dev`) **çalışıyor** olması lazım
- Windows Güvenlik Duvarı bir izin penceresi çıkarırsa "İzin Ver" de

### 4) Geliştirme Sunucusunu Başlat
```bash
npx expo start
```
Terminalde bir **QR kod** görünecek.

### 5) Telefonunda Aç
- **Android:** Expo Go uygulamasını aç, QR kodu tarat
- **iOS:** Telefonun kamerasıyla QR kodu tarat, çıkan bildirime dokun (Expo Go'yu otomatik açar)

Uygulama telefonunda açılmalı. Kayıt ol, giriş yap, bir proje oluştur -- backend'deki
veritabanında gerçekten oluştuğunu (`GET /projects` ile) doğrulayabilirsin.

---

## Klasör Yapısı Mantığı

```
App.tsx                     -> uygulamanın en tepesi, AuthProvider + Navigator'ı sarar
src/
  api/
    client.ts                  -> axios ayarları, token'ı otomatik header'a ekler
    auth.ts                     -> /auth/register, /auth/login çağrıları
    projects.ts                  -> /projects çağrıları
  context/
    AuthContext.tsx               -> global "kim giriş yapmış" durumu (backend'deki
                                      JwtAuthGuard'ın istemci tarafındaki karşılığı gibi)
  navigation/
    AppNavigator.tsx                -> giriş durumuna göre hangi ekranların gösterileceği
  screens/
    LoginScreen.tsx                  -> HER yeni ekran bu dosyaların desenini takip eder:
    RegisterScreen.tsx                  - useState ile form alanları
    HomeScreen.tsx                       - bir api/ fonksiyonunu çağırma
    CreateProjectScreen.tsx               - yükleniyor/hata durumlarını yönetme
  types/
    auth.ts                           -> backend DTO'larıyla birebir eşleşen TS tipleri
    project.ts
```

## Yeni Bir Ekran Eklerken İzlenecek Desen

Örneğin "Daireler" ekranı eklemek istersen:

1. `src/types/unit.ts` — backend'deki `CreateUnitDto`'ya karşılık gelen tip
2. `src/api/units.ts` — `fetchUnits()`, `createUnit()` gibi fonksiyonlar (`projects.ts`'e bak)
3. `src/screens/UnitsScreen.tsx` — `HomeScreen.tsx`'teki deseni takip et (useFocusEffect,
   FlatList, yükleniyor durumu)
4. `src/navigation/AppNavigator.tsx`'e yeni ekranı `Stack.Screen` olarak ekle

Bu adımların her birinde birlikte ilerleyebiliriz.

## Sorun Giderme

**"AsyncStorageError: Native module is null" hatası alıyorum:** Bu paketin 3.x sürümleri
Expo SDK 54+ ile çalışmıyor. `package.json`'da sürüm `2.2.0` olarak SABİTLENDİ, değiştirme.
Eğer bir şekilde yükseldiyse şunu çalıştır:
```bash
npm install @react-native-async-storage/async-storage@2.2.0
npx expo start --clear
```

**Paket sürümleri karıştıysa:** `npx expo install --fix` çalıştır, SDK'nla uyumlu sürümlere
otomatik düzeltir.

**"Network Error" alıyorum:** `API_BASE_URL`'i kontrol et, backend'in çalıştığından ve
telefon+PC'nin aynı WiFi'da olduğundan emin ol.

**QR kod okunmuyor / bağlanamıyor:** `npx expo start --tunnel` dene (daha yavaş ama
farklı ağlardaki cihazlar arasında da çalışır, WiFi sorunlarını atlamak için faydalı).

**"Project is incompatible with this version of Expo Go":** expo.dev/go adresinden,
projenin SDK sürümüyle (bkz. `package.json` içindeki `expo` sürümü) eşleşen Expo Go
derlemesini indirip kur.
