import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API adresi. Geliştirme ortamında cihaz ve sunucu ayrı makinelerde çalıştığı için
// "localhost" kullanılamaz; makinenin yerel ağ IP'si (192.168.x.x / 10.x.x.x) gerekir.
// Cihaz ile sunucunun aynı ağda olması ve 3000 portunun güvenlik duvarında açık olması şart.
//
// TODO: Bu değer ortam değişkenine (app.config.ts + EXPO_PUBLIC_API_URL) taşınmalı.
// Şu haliyle her ortam değişiminde dosyanın elle düzenlenmesi gerekiyor.
const API_BASE_URL = 'http://BURAYA_PC_IP_ADRESIN:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Kayıtlı token varsa her isteğin Authorization header'ına otomatik eklenir.
// Çağrı noktalarının token yönetimiyle uğraşmasına gerek kalmaz.
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
