import { apiClient } from './client';
import {
  CostCategory,
  CostItem,
  CostItemPaymentSummary,
  CreateCostCategoryPayload,
  CreateCostItemPayload,
  CreateCostPaymentPayload,
  ProjectCostSummaryRow,
} from '../types/cost';

export async function fetchCostCategories(): Promise<CostCategory[]> {
  const response = await apiClient.get<CostCategory[]>('/cost-categories');
  return response.data;
}

export async function createCostCategoryRequest(
  payload: CreateCostCategoryPayload,
): Promise<CostCategory> {
  const response = await apiClient.post<CostCategory>('/cost-categories', payload);
  return response.data;
}

export async function fetchCostItems(projectId: string): Promise<CostItem[]> {
  const response = await apiClient.get<CostItem[]>(`/projects/${projectId}/cost-items`);
  return response.data;
}

export async function createCostItemRequest(
  projectId: string,
  payload: CreateCostItemPayload,
): Promise<CostItem> {
  const response = await apiClient.post<CostItem>(`/projects/${projectId}/cost-items`, payload);
  return response.data;
}

export async function fetchProjectCostSummary(projectId: string): Promise<ProjectCostSummaryRow[]> {
  const response = await apiClient.get<ProjectCostSummaryRow[]>(
    `/projects/${projectId}/cost-summary`,
  );
  return response.data;
}

export async function fetchCostItemBalance(costItemId: string): Promise<CostItemPaymentSummary> {
  const response = await apiClient.get<CostItemPaymentSummary>(
    `/cost-items/${costItemId}/balance`,
  );
  return response.data;
}

export async function createCostPaymentRequest(
  costItemId: string,
  payload: CreateCostPaymentPayload,
): Promise<unknown> {
  const response = await apiClient.post(`/cost-items/${costItemId}/payments`, payload);
  return response.data;
}
