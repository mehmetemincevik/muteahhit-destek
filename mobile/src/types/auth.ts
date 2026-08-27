// Bu tipler, backend'deki DTO'larla (register.dto.ts, login.dto.ts) BİREBİR eşleşecek
// şekilde yazıldı. Backend'de bir alan değişirse, burada da güncellemen gerekir.

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
