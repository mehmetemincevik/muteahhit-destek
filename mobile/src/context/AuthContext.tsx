import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginRequest, registerRequest } from '../api/auth';
import { LoginPayload, RegisterPayload, User } from '../types/auth';

// ============================================
// Bu Context, uygulamanın HER YERİNDEN erişilebilen "kim giriş yapmış" bilgisini tutar.
// Backend'deki mantıkla karşılaştırırsan: backend'de her istekte JWT'yi çözüp
// request.user'a yazıyorduk (JwtStrategy.validate). Burada da benzer bir fikir var,
// ama sunucu tarafında değil, TELEFONDA: uygulama açıldığında AsyncStorage'daki
// (telefonun kalıcı depolama alanı) token'ı okuyup "bu kullanıcı hâlâ giriş yapmış mı"
// diye kontrol ediyoruz.
// ============================================

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

  // Uygulama ilk açıldığında ÇALIŞIR: telefonda daha önce kaydedilmiş bir token var mı bak.
  // Varsa kullanıcıyı "zaten giriş yapmış" say (tekrar login ekranı gösterme).
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

// Ekranlarda "const { user, login } = useAuth();" şeklinde kullanılacak custom hook.
// Context'i her ekranda "useContext(AuthContext)" diye uzun uzun yazmak yerine kısaltıyor.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth() sadece AuthProvider içindeki bileşenlerde kullanılabilir');
  }
  return context;
}
