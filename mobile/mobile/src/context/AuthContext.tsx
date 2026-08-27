import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginRequest, registerRequest } from '../api/auth';
import { LoginPayload, RegisterPayload, User } from '../types/auth';

// Oturum durumunun tek kaynağı. Token ve kullanıcı bilgisi AsyncStorage'da
// saklanır, uygulama açılışında geri yüklenir.
//
// Bilinen sınırlama: token süresi dolduğunda (backend'de 7 gün) otomatik yenileme
// yok. Süresi geçmiş token'la yapılan istek 401 döner ve ekranda hata olarak görünür.
// TODO: 401 yakalayan bir response interceptor ekleyip oturumu düşürmek gerekiyor.

interface AuthContextValue {
  user: User | null;
  isLoading: boolean; // uygulama ilk açılırken AsyncStorage kontrolü süren an
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Açılışta kayıtlı oturumu geri yükler. Token'ın geçerliliği burada doğrulanmaz;
  // geçersizse ilk API çağrısında 401 ile anlaşılır.
  useEffect(() => {
    async function restoreSession() {
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('accessToken');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    }
    restoreSession();
  }, []);

  async function login(payload: LoginPayload) {
    const response = await loginRequest(payload);
    await AsyncStorage.setItem('accessToken', response.accessToken);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  }

  async function register(payload: RegisterPayload) {
    const response = await registerRequest(payload);
    await AsyncStorage.setItem('accessToken', response.accessToken);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  }

  async function logout() {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Provider dışında çağrılırsa hata fırlatır; böylece eksik sarmalama
// sessizce undefined dönmek yerine anında fark edilir.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth() sadece AuthProvider içindeki bileşenlerde kullanılabilir');
  }
  return context;
}
