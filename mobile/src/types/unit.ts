export type OwnershipStatus = 'available' | 'sold' | 'given_to_land_owner';

export interface Unit {
  id: string;
  blockId: string;
  floorNo: number;
  unitNo: string;
  roomLayout?: string;
  grossM2?: number;
  netM2?: number;
  ownershipStatus: OwnershipStatus;
  salePrice?: number;
  estimatedSaleValue?: number;
  buyerId?: string;
  landOwnerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Block {
  id: string;
  projectId: string;
  name: string;
  floorCount?: number;
  units: Unit[];
  createdAt: string;
}

export interface CreateBlockPayload {
  name: string;
  floorCount?: number;
}

export interface CreateUnitPayload {
  floorNo: number;
  unitNo: string;
  roomLayout?: string;
  grossM2?: number;
  salePrice?: number;
}

export interface UpdateUnitStatusPayload {
  status: OwnershipStatus;
  buyerId?: string;
  landOwnerId?: string;
}

export interface Buyer {
  id: string;
  contractorId: string;
  fullName: string;
  phone?: string;
  email?: string;
  tcOrVkn?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateBuyerPayload {
  fullName: string;
  phone?: string;
  email?: string;
  tcOrVkn?: string;
  address?: string;
}
