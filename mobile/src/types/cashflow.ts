export type CashflowEntryType = 'check' | 'rent' | 'installment_payment' | 'other';
export type CashflowDirection = 'income' | 'expense';
export type CashflowStatus = 'pending' | 'paid' | 'overdue';

export interface CashflowEntry {
  id: string;
  contractorId: string;
  entryType: CashflowEntryType;
  direction: CashflowDirection;
  title: string;
  originalAmount: string; // numeric -> string
  currentAmount: string; // gecikme faiziyle artmış güncel tutar
  dueDate: string;
  status: CashflowStatus;
  paidDate?: string;
  dailyInterestRate?: string;
  sourceTable?: string;
  sourceId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Her günün faiz işlemi ayrı bir kayıt -- geçmiş asla silinmiyor
export interface InterestAccrual {
  id: string;
  calendarEntryId: string;
  accrualDate: string;
  interestAmount: string;
  balanceBefore: string;
  balanceAfter: string;
  createdAt: string;
}

export interface CashflowEntryDetail {
  entry: CashflowEntry;
  accruals: InterestAccrual[];
}

export interface CreateCashflowEntryPayload {
  entryType: CashflowEntryType;
  direction: CashflowDirection;
  title: string;
  originalAmount: number;
  dueDate: string;
  dailyInterestRate?: number | null;
  unitId?: string;
  rentalId?: string;
  notes?: string;
}

export interface MarkAsPaidPayload {
  paidDate: string;
  paymentMethod?: string;
}
