export type CostType = 'fixed' | 'variable';
export type CostSource = 'manual' | 'architectural_project' | 'static_project';
export type CostPaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'other';

export interface CostCategory {
  id: string;
  name: string;
  costType: CostType;
  isSystemDefault: boolean;
  createdAt: string;
}

export interface CostItem {
  id: string;
  projectId: string;
  categoryId: string;
  category?: CostCategory; // relations ile birlikte gelir
  name: string;
  quantity?: string;
  unit?: string;
  unitPrice?: string;
  totalCost: string; // numeric -> string
  source: CostSource;
  extraSpecs?: Record<string, any>;
  incurredDate?: string;
  createdAt: string;
}

// SQL VIEW'dan ham geliyor -> snake_case + string sayılar
export interface CostItemPaymentSummary {
  cost_item_id: string;
  total_cost: string;
  total_paid: string;
  remaining_balance: string;
  is_fully_paid: boolean;
}

// project_cost_summary view -- kategori bazında gruplanmış toplamlar
export interface ProjectCostSummaryRow {
  project_id: string;
  cost_type: CostType;
  category_name: string;
  category_total: string;
}

export interface CreateCostCategoryPayload {
  name: string;
  costType: CostType;
}

export interface CreateCostItemPayload {
  categoryId: string;
  name: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  totalCost: number;
  incurredDate?: string;
}

export interface CreateCostPaymentPayload {
  amount: number;
  paymentDate: string;
  paymentMethod?: CostPaymentMethod;
  note?: string;
}
