// ============================================
// TASARIM TOKEN SİSTEMİ
// Palet, mimari proje kağıdı / inşaat sahası dünyasından türetildi -- jenerik "AI uygulaması"
// görünümünden (kremsi zemin + turuncu vurgu, ya da siyah zemin + neon vurgu) bilerek uzak
// duruldu. Buradaki her renk, projenin konusuyla (inşaat/mimari) bağlantılı bir anlam taşıyor.
// ============================================

export const colors = {
  // Zemin: soğuk, hafif gri "proje kağıdı" tonu -- sıcak kremsi değil, teknik çizim kağıdına yakın
  paper: '#F0F1ED',
  paperElevated: '#FFFFFF', // kartlar/formlar gibi "kağıdın üzerine konan" yüzeyler için

  // Yapı: koyu "mimari çizim mürekkebi" lacivert-antrasit -- düz siyah değil, hafif mavi tonlu
  ink: '#1A2332',
  inkMuted: '#5B6472', // ikincil metin

  // Çizgiler: proje kağıdındaki ince ızgara çizgileri gibi
  hairline: '#D8D9D3',

  // Birincil vurgu: inşaat sarısı/amber (baret, vinç, uyarı bandı) -- CTA'lar için
  accent: '#E29B2E',
  accentInk: '#5C3D0A', // amber zemin üzerinde okunaklı koyu metin

  // Daire/varlık durum renkleri -- her biri farklı bir anlam taşır, birbirine karışmasın diye
  // ayrı ton ailelerinden seçildi
  statusAvailable: '#3E7C59', // yeşil -- boşta
  statusSold: '#1A2332', // ink -- kesinleşmiş, "yapı"nın kendisi kadar kesin
  statusGiven: '#8B6F3E', // bronz -- arsa sahibine verildi

  // Acil/hata durumları (gecikmiş ödeme gibi) -- durum renklerinden AYRI, karışmasın diye
  danger: '#A6402B',
  dangerBg: '#F5E6E2',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 4, // bilerek KÜÇÜK -- jenerik "her şey yuvarlak hap" görünümünden kaçınmak için
  md: 6,
};

// Space Grotesk: geometrik, teknik bir görünüm -- mimari çizim/blueprint hissi veriyor.
// Sistem fontundan (gövde metni) BİLEREK farklı -- ikisi karıştırılmıyor, her biri kendi işini yapıyor.
export const fonts = {
  display: 'SpaceGrotesk_700Bold',
  displayMedium: 'SpaceGrotesk_600SemiBold',
  label: 'SpaceGrotesk_500Medium', // "KAT 3", "A BLOK" gibi teknik etiketler için
  // body: sistem fontu (San Francisco / Roboto) -- ayrıca tanımlamaya gerek yok, React Native
  // varsayılanı zaten bu, hızlı yüklenir ve platformun kendi hissini korur.
};

export const typeScale = {
  display: { fontFamily: fonts.display, fontSize: 28, color: colors.ink },
  h1: { fontFamily: fonts.displayMedium, fontSize: 22, color: colors.ink },
  h2: { fontFamily: fonts.displayMedium, fontSize: 17, color: colors.ink },
  label: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.inkMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  body: { fontSize: 15, color: colors.ink },
  bodyMuted: { fontSize: 14, color: colors.inkMuted },
};
