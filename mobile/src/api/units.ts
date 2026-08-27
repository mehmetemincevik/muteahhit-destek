import { apiClient } from './client';
import {
  Block,
  Buyer,
  CreateBlockPayload,
  CreateBuyerPayload,
  CreateUnitPayload,
  Unit,
  UpdateUnitStatusPayload,
} from '../types/unit';

export async function fetchBlocks(projectId: string): Promise<Block[]> {
  const response = await apiClient.get<Block[]>(`/projects/${projectId}/blocks`);
  return response.data;
}

export async function createBlockRequest(projectId: string, payload: CreateBlockPayload): Promise<Block> {
  const response = await apiClient.post<Block>(`/projects/${projectId}/blocks`, payload);
  return response.data;
}

export async function createUnitRequest(blockId: string, payload: CreateUnitPayload): Promise<Unit> {
  const response = await apiClient.post<Unit>(`/blocks/${blockId}/units`, payload);
  return response.data;
}

export async function updateUnitStatusRequest(
  unitId: string,
  payload: UpdateUnitStatusPayload,
): Promise<Unit> {
  const response = await apiClient.patch<Unit>(`/units/${unitId}/status`, payload);
  return response.data;
}

export async function fetchBuyers(): Promise<Buyer[]> {
  const response = await apiClient.get<Buyer[]>('/buyers');
  return response.data;
}

export async function createBuyerRequest(payload: CreateBuyerPayload): Promise<Buyer> {
  const response = await apiClient.post<Buyer>('/buyers', payload);
  return response.data;
}
