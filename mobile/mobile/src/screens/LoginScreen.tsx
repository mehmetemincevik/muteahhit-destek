import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { colors, spacing, typeScale } from '../theme/tokens';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (!phone || !password) {
      Alert.alert('Eksik bilgi', 'Telefon ve şifre alanlarını doldurun');
      return;
    }
    setIsSubmitting(true);
    try {
      await login({ phone, password });
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message;
      const statusCode = error?.response?.status;

      let message: string;
      if (statusCode === 429) {
        message = 'Çok fazla deneme yapıldı. Bir dakika bekleyip tekrar dene.';
      } else if (backendMessage) {
        message = Array.isArray(backendMessage) ? backendMessage.join('\n') : backendMessage;
      } else if (error?.message === 'Network Error') {
        message = 'Sunucuya ulaşılamıyor. Backend çalışıyor mu, IP adresi doğru mu?';
      } else {
        message = error?.message || 'Bilinmeyen hata';
      }

      Alert.alert(`Giriş başarısız${statusCode ? ` (${statusCode})` : ''}`, message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.eyebrow}>
        <View style={styles.eyebrowLine} />
        <Text style={typeScale.label}>MÜTEAHHİT TAKİP</Text>
      </View>
      <Text style={[typeScale.display, styles.title]}>Giriş Yap</Text>

      <TextField
        label="Telefon"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoCapitalize="none"
        placeholder="5XX XXX XX XX"
      />
      <TextField
        label="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••"
      />

      <Button label="Giriş Yap" onPress={handleLogin} isLoading={isSubmitting} style={styles.submitButton} />

      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
        Hesabın yok mu? <Text style={styles.linkAccent}>Kayıt ol</Text>
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.paper },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  eyebrowLine: { width: 24, height: 2, backgroundColor: colors.accent },
  title: { marginBottom: spacing.xl },
  submitButton: { marginTop: spacing.sm },
  link: { ...typeScale.bodyMuted, textAlign: 'center', marginTop: spacing.lg },
  linkAccent: { color: colors.ink, fontWeight: '600' },
});
