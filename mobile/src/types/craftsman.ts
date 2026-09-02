export type PriceType = 'per_m2' | 'fixed' | 'negotiable';
export type AssignmentStatus = 'active' | 'completed' | 'cancelled';

export interface CraftsmanProfile {
  id: string;
  userId: string;
  companyName?: string;
  specialtySummary?: string;
  province?: string;
  district?: string;
  yearsOfExperience?: number;
  bio?: string;
  averageRating: string; // numeric -> string
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePackageItem {
  id: string;
  packageId: string;
  itemName: string;
  priceType?: PriceType;
  priceAmount?: string;
  createdAt: string;
}

export interface ServicePackage {
  id: string;
  craftsmanId: string;
  templateId?: string;
  name: string;
  description?: string;
  priceType?: PriceType;
  priceAmount?: string;
  isActive: boolean;
  items?: ServicePackageItem[];
  createdAt: string;
}

export interface PortfolioImage {
  id: string;
  craftsmanId: string;
  packageId?: string;
  imageUrl: string;
  caption?: string;
  uploadedAt: string;
}

export interface CraftsmanReview {
  id: string;
  craftsmanId: string;
  contractorId: string;
  projectId?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// GET /craftsmen/:id yanıtı
export interface CraftsmanDetail {
  profile: CraftsmanProfile;
  packages: ServicePackage[];
  portfolioImages: PortfolioImage[];
  reviews: CraftsmanReview[];
}

export interface ProjectAssignment {
  id: string;
  projectId: string;
  craftsmanId: string;
  packageId?: string;
  agreedPrice?: string;
  status: AssignmentStatus;
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  // relations ile birlikte gelebilir
  project?: { id: string; name: string; status: string };
  craftsman?: CraftsmanProfile;
}

// Hazır hizmet paketi şablonları (salt okunur)
export interface ServicePackageTemplateItem {
  id: string;
  templateId: string;
  itemName: string;
  defaultPriceType?: PriceType;
  displayOrder: number;
}

export interface ServicePackageTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  items: ServicePackageTemplateItem[];
}

export interface UpsertProfilePayload {
  companyName?: string;
  specialtySummary?: string;
  province?: string;
  district?: string;
  yearsOfExperience?: number;
  bio?: string;
}

export interface CreatePackagePayload {
  templateId?: string;
  name: string;
  description?: string;
  priceType?: PriceType;
  priceAmount?: number;
}

export interface CreatePackageItemPayload {
  itemName: string;
  priceType?: PriceType;
  priceAmount?: number;
}

export interface AddPortfolioImagePayload {
  imageUrl: string;
  packageId?: string;
  caption?: string;
}

// Cihazdan seçilen görsel. expo-image-picker'ın döndürdüğü alanlardan yalnızca
// yükleme için gerekli olanlar taşınır.
export interface PickedImage {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}

export interface UploadPortfolioImagePayload {
  // Cihazdaki yerel dosya yolu (file://...). FormData ile gönderilir.
  uri: string;
  fileName: string;
  mimeType: string;
  caption?: string;
  packageId?: string;
}
