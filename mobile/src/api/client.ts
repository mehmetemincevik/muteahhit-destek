import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// ÖNEMLİ: Telefonun (Expo Go üzerinden), bilgisayarındaki backend'e "localhost" ile
// ULAŞAMAZ -- çünkü telefon ve bilgisayar FİZİKSEL OLARAK farklı cihazlar. "localhost"
// telefonun kendisini işaret eder, senin PC'ni değil.
//
// Bunun yerine PC'nin YEREL AĞ IP'sini kullanman lazım (örn. 192.168.1.34 gibi).
// Bulmak için Windows'ta PowerShell'de: ipconfig  -> "IPv4 Address" satırına bak.
//
// Telefon ve bilgisayar AYNI WiFi ağında olmalı. Ayrıca Windows Güvenlik Duvarı
// 3000 portuna gelen bağlantıya izin vermeli (ilk bağlantı denemesinde Windows
// otomatik bir izin penceresi çıkarabilir, "İzin Ver" de).
// ============================================
const API_BASE_URL = 'http://BURAYA_PC_IP_ADRESIN:3000'; // örn: http://192.168.1.34:3000

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Her istekte, cihazda kayıtlı token varsa otomatik olarak Authorization header'ına ekler.
// Bu sayede her API çağrısında elle "Bearer ..." yazmamıza gerek kalmıyor.
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
