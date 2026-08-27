import { apiClient } from './client';
import { CreatePaymentPayload, Payment, UnitPaymentSummary } from '../types/payment';

export async function fetchPayments(unitId: string): Promise<Payment[]> {
  const response = await apiClient.get<Payment[]>(`/units/${unitId}/payments`);
  return response.data;
}

export async function fetchUnitBalance(unitId: string): Promise<UnitPaymentSummary> {
  const response = await apiClient.get<UnitPaymentSummary>(`/units/${unitId}/balance`);
  return response.data;
}

export async function createPaymentRequest(
  unitId: string,
  payload: CreatePaymentPayload,
): Promise<Payment> {
  const response = await apiClient.post<Payment>(`/units/${unitId}/payments`, payload);
  return response.data;
}
