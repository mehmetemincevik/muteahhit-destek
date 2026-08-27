// Tasarım token'ları. Renk, boşluk ve tipografi değerleri yalnızca buradan okunur;
// ekranlarda ham hex kodu veya sabit piksel değeri kullanılmaz.
// Palet, teknik çizim ve şantiye ekipmanı renklerinden türetilmiştir.

export const colors = {
  // Zemin: soğuk gri, teknik çizim kağıdı tonu
  paper: '#F0F1ED',
  paperElevated: '#FFFFFF', // kart ve form yüzeyleri

  // Metin ve yapı öğeleri: mavi tonlu koyu antrasit (saf siyah değil)
  ink: '#1A2332',
  inkMuted: '#5B6472', // ikincil metin

  // Ayraç çizgileri ve pasif çerçeveler
  hairline: '#D8D9D3',

  // Birincil vurgu: şantiye sarısı. Yalnızca ana aksiyonlarda kullanılır.
  accent: '#E29B2E',
  accentInk: '#5C3D0A', // amber zemin üzerinde okunaklı koyu metin

  // Daire durum renkleri. Ayrı ton ailelerinden seçilmiştir; küçük ızgara
  // hücrelerinde yan yana geldiklerinde ayırt edilebilir olmaları gerekir.
  statusAvailable: '#3E7C59', // boşta
  statusSold: '#1A2332', // satıldı
  statusGiven: '#8B6F3E', // arsa sahibine verildi

  // Hata ve gecikme durumları. Daire durum renklerinden ayrı tutulur.
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
  sm: 4,
  md: 6,
};

// Başlıklar ve teknik etiketler Space Grotesk ile, gövde metni sistem fontuyla dizilir.
// Bu ayrım korunmalı: iki font aynı metin bloğunda karıştırılmaz.
export const fonts = {
  display: 'SpaceGrotesk_700Bold',
  displayMedium: 'SpaceGrotesk_600SemiBold',
  label: 'SpaceGrotesk_500Medium', // "KAT 3", "A BLOK" gibi teknik etiketler için
  // Gövde metni için ayrı tanım yok; React Native varsayılanı (San Francisco / Roboto)
  // kullanılır. Ek yükleme maliyeti getirmez ve platformun kendi okuma ritmini korur.
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
