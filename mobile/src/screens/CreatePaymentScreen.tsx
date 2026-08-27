import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { createPaymentRequest } from '../api/payments';
import { PaymentMethod } from '../types/payment';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { parseAmount } from '../utils/format';

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Nakit' },
  { value: 'bank_transfer', label: 'Havale' },
  { value: 'check', label: 'Çek' },
  { value: 'other', label: 'Diğer' },
];

// Bugünün tarihini backend'in beklediği formatta (YYYY-MM-DD) döndürür
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CreatePaymentScreen({ route, navigation }: any) {
  const { unitId, unitLabel } = route.params;
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(todayISO());
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate() {
    const parsedAmount = parseAmount(amount);
    if (parsedAmount == null || parsedAmount <= 0) {
      Alert.alert('Geçersiz tutar', 'Sıfırdan büyük bir tutar gir');
      return;
    }
    // Backend IsDateString bekliyor -- basit bir format kontrolü yapıyoruz ki
    // kullanıcı yanlış yazdığında sunucudan gelen teknik hata yerine anlamlı mesaj görsün.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(paymentDate)) {
      Alert.alert('Geçersiz tarih', 'Tarihi YYYY-AA-GG şeklinde gir (örn. 2026-03-15)');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPaymentRequest(unitId, {
        amount: parsedAmount,
        paymentDate,
        paymentMethod: method,
        note: note || undefined,
      });
      navigation.goBack();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Ödeme kaydedilemedi';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={typeScale.label}>{unitLabel}</Text>
      <Text style={[typeScale.display, styles.title]}>Yeni Ödeme</Text>

      <TextField
        label="Tutar (TL) *"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="örn. 250000"
      />

      <TextField
        label="Ödeme Tarihi *"
        value={paymentDate}
        onChangeText={setPaymentDate}
        placeholder="YYYY-AA-GG"
      />

      <Text style={[typeScale.label, { marginBottom: spacing.sm }]}>ÖDEME YÖNTEMİ</Text>
      <View style={styles.methodRow}>
        {METHODS.map((m) => (
          <TouchableOpacity
            key={m.value}
            style={[styles.methodOption, method === m.value && styles.methodOptionActive]}
            onPress={() => setMethod(m.value)}
          >
            <Text style={method === m.value ? styles.methodTextActive : styles.methodText}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextField label="Not" value={note} onChangeText={setNote} placeholder="opsiyonel" multiline />

      <Button label="Kaydet" onPress={handleCreate} isLoading={isSubmitting} style={styles.submitButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: 60, backgroundColor: colors.paper },
  title: { marginBottom: spacing.xl },
  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  methodOption: {
    borderWidth: 1.5,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  methodOptionActive: { borderColor: colors.ink, backgroundColor: colors.ink },
  methodText: { fontFamily: fonts.label, fontSize: 12, color: colors.ink, letterSpacing: 0.6 },
  methodTextActive: { fontFamily: fonts.label, fontSize: 12, color: colors.paper, letterSpacing: 0.6 },
  submitButton: { marginTop: spacing.sm },
});
