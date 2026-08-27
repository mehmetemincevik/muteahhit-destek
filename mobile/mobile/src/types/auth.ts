// Backend DTO'larıyla (register.dto.ts, login.dto.ts) birebir eşleşir.
// Backend tarafında bir alan değişirse bu dosya da güncellenmeli.

export type UserRole = 'contractor' | 'craftsman';

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  phone: string;
  email?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RegisterPayload {
  role: UserRole;
  fullName: string;
  phone: string;
  email?: string;
  password: string;
}

export interface LoginPayload {
  phone: string;
  password: string;
}
