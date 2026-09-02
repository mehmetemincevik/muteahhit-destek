import { apiClient } from './client';
import {
  Asset,
  AssetDetail,
  AssetRental,
  CreateAssetPayload,
  CreateRentalPayload,
  CreateRentalPaymentPayload,
  CreateTransactionPayload,
  CreateValueSnapshotPayload,
} from '../types/asset';

export async function fetchAssets(): Promise<Asset[]> {
  const response = await apiClient.get<Asset[]>('/assets');
  return response.data;
}

export async function fetchAssetDetail(assetId: string): Promise<AssetDetail> {
  const response = await apiClient.get<AssetDetail>(`/assets/${assetId}`);
  return response.data;
}

export async function createAssetRequest(payload: CreateAssetPayload): Promise<Asset> {
  const response = await apiClient.post<Asset>('/assets', payload);
  return response.data;
}

export async function createTransactionRequest(
  assetId: string,
  payload: CreateTransactionPayload,
): Promise<unknown> {
  const response = await apiClient.post(`/assets/${assetId}/transactions`, payload);
  return response.data;
}

export async function createRentalRequest(
  assetId: string,
  payload: CreateRentalPayload,
): Promise<AssetRental> {
  const response = await apiClient.post<AssetRental>(`/assets/${assetId}/rentals`, payload);
  return response.data;
}

export async function createRentalPaymentRequest(
  rentalId: string,
  payload: CreateRentalPaymentPayload,
): Promise<unknown> {
  const response = await apiClient.post(`/rentals/${rentalId}/payments`, payload);
  return response.data;
}

export async function createValueSnapshotRequest(
  assetId: string,
  payload: CreateValueSnapshotPayload,
): Promise<unknown> {
  const response = await apiClient.post(`/assets/${assetId}/value-snapshots`, payload);
  return response.data;
}
