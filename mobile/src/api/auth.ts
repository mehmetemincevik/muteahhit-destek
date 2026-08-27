import { apiClient } from './client';
import { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth';

// Bu dosya, backend'in /auth endpoint'lerine karşılık gelen çağrıları içerir.
// Servis katmanı (screens/) bu fonksiyonları çağırır, axios detaylarıyla hiç uğraşmaz.

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', payload);
  return response.data;
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', payload);
  return response.data;
}
