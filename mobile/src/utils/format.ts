// Backend numeric alanları string olarak döndürüyor ("300000.00"), bunları
// okunabilir Türkçe para formatına çeviriyoruz: "300.000 ₺"
export function formatCurrency(value: string | number | null | undefined): string {
  if (value == null) return '—';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) return '—';
  return `${num.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺`;
}

// "2026-01-15" -> "15.01.2026"
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('tr-TR');
}

// Kullanıcının girdiği metni sayıya çevirir. Türkçe klavyede virgül kullanılabildiği
// için virgülü noktaya çeviriyoruz ("1500,50" -> 1500.50).
export function parseAmount(text: string): number | null {
  const normalized = text.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(normalized);
  return Number.isNaN(num) ? null : num;
}
