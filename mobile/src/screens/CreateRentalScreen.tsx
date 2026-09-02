import React, { useState } from 'react';
import { Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { createRentalRequest } from '../api/assets';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { DateField } from '../components/DateField';
import { colors, spacing, typeScale } from '../theme/tokens';
import { parseAmount } from '../utils/format';

export default function CreateRentalScreen({ route, navigation }: any) {
  const { assetId, assetName } = route.params;
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate() {
    const parsedRent = parseAmount(monthlyRent);
    if (parsedRent == null || parsedRent <= 0) {
      Alert.alert('Geçersiz tutar', 'Aylık kira sıfırdan büyük olmalı');
      return;
    }
    // Her iki tarih de opsiyonel; ikisi de girildiyse sıralama tutarlı olmalı.
    if (startDate && endDate && endDate < startDate) {
      Alert.alert('Geçersiz tarih', 'Sözleşme bitişi başlangıçtan önce olamaz');
      return;
    }

    setIsSubmitting(true);
    try {
      await createRentalRequest(assetId, {
        tenantName: tenantName || undefined,
        tenantPhone: tenantPhone || undefined,
        monthlyRent: parsedRent,
        contractStartDate: startDate || undefined,
        contractEndDate: endDate || undefined,
      });
      navigation.goBack();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Kira sözleşmesi oluşturulamadı';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={typeScale.label}>{assetName}</Text>
      <Text style={[typeScale.display, styles.title]}>Kira Sözleşmesi</Text>

      <TextField label="Kiracı Adı" value={tenantName} onChangeText={setTenantName} placeholder="opsiyonel" />
      <TextField
        label="Kiracı Telefonu"
        value={tenantPhone}
        onChangeText={setTenantPhone}
        keyboardType="phone-pad"
        placeholder="opsiyonel"
      />
      <TextField
        label="Aylık Kira (TL) *"
        value={monthlyRent}
        onChangeText={setMonthlyRent}
        keyboardType="decimal-pad"
        placeholder="örn. 15000"
      />
      <DateField
        label="Sözleşme Başlangıcı"
        value={startDate}
        onChange={setStartDate}
        placeholder="Opsiyonel"
        clearable
      />
      <DateField
        label="Sözleşme Bitişi"
        value={endDate}
        onChange={setEndDate}
        placeholder="Opsiyonel"
        clearable
      />

      <Button label="Kaydet" onPress={handleCreate} isLoading={isSubmitting} style={styles.submitButton} />

      <Text style={styles.footnote}>
        Kira gelirleri deftere işlenir, mülkün değerini değiştirmez. Mülk değeri yalnızca
        değerleme kayıtlarından güncellenir.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: 60, backgroundColor: colors.paper },
  title: { marginBottom: spacing.xl },
  submitButton: { marginTop: spacing.sm },
  footnote: { ...typeScale.bodyMuted, fontSize: 12, marginTop: spacing.md, lineHeight: 17 },
});
