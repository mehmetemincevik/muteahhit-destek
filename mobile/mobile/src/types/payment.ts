export type PaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'other';

export interface Payment {
  id: string;
  unitId: string;
  amount: string; // DİKKAT: backend numeric alanları STRING olarak döndürür ("300000.00")
  paymentDate: string;
  paymentMethod?: PaymentMethod;
  note?: string;
  createdAt: string;
}

// unit_payment_summary view'ından ham olarak döner: alan adları snake_case,
// sayısal değerler string. Diğer uçlardaki camelCase dönüşümü burada uygulanmaz.
export interface UnitPaymentSummary {
  unit_id: string;
  sale_price: string | null;
  total_paid: string;
  remaining_balance: string | null;
  payment_count: string;
}

export interface CreatePaymentPayload {
  amount: number;
  paymentDate: string;
  paymentMethod?: PaymentMethod;
  note?: string;
}
