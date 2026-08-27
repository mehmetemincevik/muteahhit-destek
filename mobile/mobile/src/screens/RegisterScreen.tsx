import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { colors, spacing, typeScale, radius, fonts } from '../theme/tokens';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [role, setRole] = useState<UserRole>('contractor');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    if (!fullName || !phone || !password) {
      Alert.alert('Eksik bilgi', 'Tüm alanları doldurun');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Şifre çok kısa', 'Şifre en az 6 karakter olmalı');
      return;
    }
    setIsSubmitting(true);
    try {
      await register({ role, fullName, phone, password });
    } catch (error: any) {
      // Hata mesajı üç kaynaktan çözümlenir: backend'in döndüğü mesaj, ağ hatası
      // (sunucuya hiç ulaşılamamışsa) ve HTTP durum kodu. Durum kodu başlıkta
      // gösterilir; hata bildirimlerinde teşhisi kolaylaştırıyor.
      const backendMessage = error?.response?.data?.message;
      const statusCode = error?.response?.status;

      let message: string;
      if (backendMessage) {
        message = Array.isArray(backendMessage) ? backendMessage.join('\n') : backendMessage;
        if (statusCode === 429) {
          message = 'Çok fazla deneme yapıldı. Bir dakika bekleyip tekrar dene.';
        }
      } else if (error?.message === 'Network Error') {
        message = 'Sunucuya ulaşılamıyor. Backend çalışıyor mu, IP adresi doğru mu?';
      } else {
        message = error?.message || 'Bilinmeyen hata';
      }

      Alert.alert(`Kayıt başarısız${statusCode ? ` (${statusCode})` : ''}`, message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={typeScale.label}>YENİ HESAP</Text>
        <Text style={[typeScale.display, styles.title]}>Kayıt Ol</Text>

        <Text style={[typeScale.label, styles.sectionLabel]}>Rolünüz</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleOption, role === 'contractor' && styles.roleOptionActive]}
            onPress={() => setRole('contractor')}
          >
            <Text style={role === 'contractor' ? styles.roleTextActive : styles.roleText}>
              Müteahhit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleOption, role === 'craftsman' && styles.roleOptionActive]}
            onPress={() => setRole('craftsman')}
          >
            <Text style={role === 'craftsman' ? styles.roleTextActive : styles.roleText}>
              Usta
            </Text>
          </TouchableOpacity>
        </View>

        <TextField label="Ad Soyad" value={fullName} onChangeText={setFullName} />
        <TextField
          label="Telefon"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
        <TextField
          label="Şifre (en az 6 karakter)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button label="Kayıt Ol" onPress={handleRegister} isLoading={isSubmitting} style={styles.submitButton} />

        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Zaten hesabın var mı? <Text style={styles.linkAccent}>Giriş yap</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.paper },
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  title: { marginBottom: spacing.lg },
  sectionLabel: { marginBottom: spacing.sm },
  roleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  roleOption: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  roleOptionActive: { borderColor: colors.ink, backgroundColor: colors.ink },
  roleText: { fontFamily: fonts.displayMedium, color: colors.ink },
  roleTextActive: { fontFamily: fonts.displayMedium, color: colors.paper },
  submitButton: { marginTop: spacing.sm },
  link: { ...typeScale.bodyMuted, textAlign: 'center', marginTop: spacing.lg },
  linkAccent: { color: colors.ink, fontWeight: '600' },
});
