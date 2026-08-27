import { apiClient } from './client';
import {
  CashflowEntry,
  CashflowEntryDetail,
  CreateCashflowEntryPayload,
  MarkAsPaidPayload,
} from '../types/cashflow';

export async function fetchCashflowEntries(): Promise<CashflowEntry[]> {
  const response = await apiClient.get<CashflowEntry[]>('/cashflow/entries');
  return response.data;
}

export async function fetchCashflowEntryDetail(entryId: string): Promise<CashflowEntryDetail> {
  const response = await apiClient.get<CashflowEntryDetail>(`/cashflow/entries/${entryId}`);
  return response.data;
}

export async function createCashflowEntryRequest(
  payload: CreateCashflowEntryPayload,
): Promise<CashflowEntry> {
  const response = await apiClient.post<CashflowEntry>('/cashflow/entries', payload);
  return response.data;
}

export async function markEntryAsPaidRequest(
  entryId: string,
  payload: MarkAsPaidPayload,
): Promise<CashflowEntry> {
  const response = await apiClient.patch<CashflowEntry>(
    `/cashflow/entries/${entryId}/mark-paid`,
    payload,
  );
  return response.data;
}
