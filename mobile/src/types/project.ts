export type ProjectStatus = 'planning' | 'construction' | 'completed' | 'on_hold';

export interface Project {
  id: string;
  contractorId: string;
  name: string;
  status: ProjectStatus;
  estimatedOccupancyDate?: string;
  isPublic: boolean;
  publicNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  name: string;
  estimatedOccupancyDate?: string;
  province?: string;
  district?: string;
  areaM2?: number;
  purchasePrice?: number;
  isKatKarsiligi?: boolean;
}

export interface LandOwner {
  id: string;
  landId: string;
  fullName: string;
  phone?: string;
  sharePercentage?: string;
  tcOrVkn?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateLandOwnerPayload {
  fullName: string;
  phone?: string;
  sharePercentage?: number;
  tcOrVkn?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  status?: ProjectStatus;
  estimatedOccupancyDate?: string;
  isPublic?: boolean;
  publicNote?: string;
}
