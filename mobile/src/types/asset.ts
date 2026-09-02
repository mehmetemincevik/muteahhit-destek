export type AssetType = 'cash' | 'commodity' | 'real_estate' | 'other';
export type TransactionDirection = 'manual_addition' | 'manual_deduction';

export type AssetTransactionType =
  | 'unit_sale_payment'
  | 'rental_income'
  | 'manual_addition'
  | 'manual_deduction'
  | 'cost_payment';

export interface Asset {
  id: string;
  contractorId: string;
  assetType: AssetType;
  name: string;
  description?: string;
  currentValue: string; // numeric -> string
  valueUpdatedAt?: string;
  province?: string;
  district?: string;
  roomLayout?: string;
  areaM2?: string;
  isGeneratingRentalIncome: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssetTransaction {
  id: string;
  contractorId: string;
  assetId?: string;
  transactionType: AssetTransactionType;
  amount: string; // negatif değerler çıkışı gösterir
  sourceTable?: string;
  sourceId?: string;
  description?: string;
  transactionDate: string;
  createdAt: string;
}

export interface AssetRental {
  id: string;
  assetId: string;
  tenantName?: string;
  tenantPhone?: string;
  monthlyRent: string;
  contractStartDate?: string;
  contractEndDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export interface AssetValueSnapshot {
  id: string;
  assetId: string;
  estimatedValue: string;
  snapshotDate: string;
  source: string;
  createdAt: string;
}

// GET /assets/:id yanıtı: varlık, hareketleri, kira sözleşmeleri ve değerleme kayıtları
export interface AssetDetail {
  asset: Asset;
  transactions: AssetTransaction[];
  rentals: AssetRental[];
  snapshots: AssetValueSnapshot[];
}

export interface CreateAssetPayload {
  assetType: AssetType;
  name: string;
  description?: string;
  province?: string;
  district?: string;
  roomLayout?: string;
  areaM2?: number;
}

export interface CreateTransactionPayload {
  direction: TransactionDirection;
  amount: number; // her zaman pozitif; işaret yön alanından türetilir
  transactionDate: string;
  description?: string;
}

export interface CreateRentalPayload {
  tenantName?: string;
  tenantPhone?: string;
  monthlyRent: number;
  contractStartDate?: string;
  contractEndDate?: string;
}

export interface CreateRentalPaymentPayload {
  amount: number;
  paymentDate: string;
  note?: string;
}

export interface CreateValueSnapshotPayload {
  estimatedValue: number;
  snapshotDate: string;
  source?: string;
}
