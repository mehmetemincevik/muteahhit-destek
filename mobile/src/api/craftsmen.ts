import { apiClient } from './client';
import {
  AddPortfolioImagePayload,
  CraftsmanDetail,
  CraftsmanProfile,
  CreatePackageItemPayload,
  CreatePackagePayload,
  ProjectAssignment,
  ServicePackage,
  ServicePackageItem,
  PickedImage,
  PortfolioImage,
  ServicePackageTemplate,
  UpsertProfilePayload,
} from '../types/craftsman';

// Kendi profili. Profil henüz oluşturulmamışsa 404 döner.
export async function fetchMyProfile(): Promise<CraftsmanProfile> {
  const response = await apiClient.get<CraftsmanProfile>('/craftsmen/profile');
  return response.data;
}

export async function upsertProfileRequest(
  payload: UpsertProfilePayload,
): Promise<CraftsmanProfile> {
  const response = await apiClient.post<CraftsmanProfile>('/craftsmen/profile', payload);
  return response.data;
}

// Usta arama listesi (müteahhit rolüne açık)
export async function fetchCraftsmen(filters?: {
  province?: string;
  district?: string;
}): Promise<CraftsmanProfile[]> {
  const response = await apiClient.get<CraftsmanProfile[]>('/craftsmen', { params: filters });
  return response.data;
}

export async function fetchCraftsmanDetail(craftsmanId: string): Promise<CraftsmanDetail> {
  const response = await apiClient.get<CraftsmanDetail>(`/craftsmen/${craftsmanId}`);
  return response.data;
}

export async function createPackageRequest(payload: CreatePackagePayload): Promise<ServicePackage> {
  const response = await apiClient.post<ServicePackage>('/craftsmen/packages', payload);
  return response.data;
}

export async function addPackageItemRequest(
  packageId: string,
  payload: CreatePackageItemPayload,
): Promise<ServicePackageItem> {
  const response = await apiClient.post<ServicePackageItem>(
    `/craftsmen/packages/${packageId}/items`,
    payload,
  );
  return response.data;
}

export async function addPortfolioImageRequest(
  payload: AddPortfolioImagePayload,
): Promise<unknown> {
  const response = await apiClient.post('/craftsmen/portfolio', payload);
  return response.data;
}

export async function fetchMyAssignments(): Promise<ProjectAssignment[]> {
  const response = await apiClient.get<ProjectAssignment[]>('/craftsmen/my-assignments');
  return response.data;
}

export async function fetchTemplates(): Promise<ServicePackageTemplate[]> {
  const response = await apiClient.get<ServicePackageTemplate[]>('/templates');
  return response.data;
}

// Cihazdaki görseli multipart/form-data ile yükler. Content-Type başlığı elle
// verilmez; sınır (boundary) değerini çalışma zamanının üretmesi gerekir.
export async function uploadPortfolioImageRequest(
  image: PickedImage,
  extra?: { packageId?: string; caption?: string },
): Promise<PortfolioImage> {
  const formData = new FormData();

  // React Native'de dosya alanı bu üçlüyle tanımlanır; web'deki File nesnesi yoktur.
  formData.append('file', {
    uri: image.uri,
    name: image.fileName || `portfolio-${Date.now()}.jpg`,
    type: image.mimeType || 'image/jpeg',
  } as any);

  if (extra?.packageId) formData.append('packageId', extra.packageId);
  if (extra?.caption) formData.append('caption', extra.caption);

  const response = await apiClient.post<PortfolioImage>('/craftsmen/portfolio/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // Görsel yükleme metin isteklerinden uzun sürebilir.
    timeout: 60000,
  });
  return response.data;
}

export async function deletePortfolioImageRequest(imageId: string): Promise<void> {
  await apiClient.delete(`/craftsmen/portfolio/${imageId}`);
}
