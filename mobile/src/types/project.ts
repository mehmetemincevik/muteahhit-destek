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
