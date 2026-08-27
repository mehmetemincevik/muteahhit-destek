import { apiClient } from './client';
import { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth';

// Backend'in /auth uçlarına karşılık gelen çağrılar. Ekran bileşenleri bu
// fonksiyonları kullanır, axios detayları bu katmanda kalır.

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', payload);
  return response.data;
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', payload);
  return response.data;
}
