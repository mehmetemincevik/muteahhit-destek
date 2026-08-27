// Backend numeric alanları string döner ("300000.00"). Türkçe para biçimine çevirir.
// Kuruş gösterilmez; tutarlar tam sayıya yuvarlanır.
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

// Serbest metin girişini sayıya çevirir. Türkçe biçimde ondalık ayracı virgül,
// binlik ayracı nokta olabildiği için ikisi de normalize edilir ("1.500,50" -> 1500.5).
export function parseAmount(text: string): number | null {
  const normalized = text.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(normalized);
  return Number.isNaN(num) ? null : num;
}
