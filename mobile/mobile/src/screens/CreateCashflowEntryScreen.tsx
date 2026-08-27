import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Switch } from 'react-native';
import { createCashflowEntryRequest } from '../api/cashflow';
import { CashflowDirection, CashflowEntryType } from '../types/cashflow';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { parseAmount } from '../utils/format';

const TYPES: { value: CashflowEntryType; label: string }[] = [
  { value: 'check', label: 'Çek' },
  { value: 'installment_payment', label: 'Taksit' },
  { value: 'rent', label: 'Kira' },
  { value: 'other', label: 'Diğer' },
];

const DEFAULT_INTEREST_RATE = '0.14'; // günlük %0,14 (ondalık: 0.0014)

export default function CreateCashflowEntryScreen({ navigation }: any) {
  const [entryType, setEntryType] = useState<CashflowEntryType>('check');
  const [direction, setDirection] = useState<CashflowDirection>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [applyInterest, setApplyInterest] = useState(true);
  const [interestPercent, setInterestPercent] = useState(DEFAULT_INTEREST_RATE);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate() {
    if (!title) {
      Alert.alert('Eksik bilgi', 'Başlık zorunlu');
      return;
    }
    const parsedAmount = parseAmount(amount);
    if (parsedAmount == null || parsedAmount <= 0) {
      Alert.alert('Geçersiz tutar', 'Sıfırdan büyük bir tutar gir');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      Alert.alert('Geçersiz tarih', 'Vade tarihini YYYY-AA-GG şeklinde gir (örn. 2026-09-15)');
      return;
    }

    // Form yüzde alır (0.14 = %0,14), backend ondalık bekler (0.0014).
    // Dönüşüm burada yapılır; alan etiketi de yüzde olduğunu belirtir.
    let dailyInterestRate: number | null = null;
    if (applyInterest) {
      const percent = parseAmount(interestPercent);
      if (percent == null || percent < 0) {
        Alert.alert('Geçersiz faiz oranı', 'Geçerli bir yüzde gir');
        return;
      }
      dailyInterestRate = percent / 100;
    }

    setIsSubmitting(true);
    try {
      await createCashflowEntryRequest({
        entryType,
        direction,
        title,
        originalAmount: parsedAmount,
        dueDate,
        dailyInterestRate,
        notes: notes || undefined,
      });
      navigation.goBack();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Kayıt oluşturulamadı';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={typeScale.label}>YENİ KAYIT</Text>
      <Text style={[typeScale.display, styles.title]}>Takvim Kaydı</Text>

      <Text style={[typeScale.label, { marginBottom: spacing.sm }]}>YÖN</Text>
      <View style={styles.directionRow}>
        <TouchableOpacity
          style={[styles.directionOption, direction === 'income' && styles.directionIncomeActive]}
          onPress={() => setDirection('income')}
        >
          <Text style={direction === 'income' ? styles.directionTextActive : styles.directionText}>
            Gelir
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.directionOption, direction === 'expense' && styles.directionExpenseActive]}
          onPress={() => setDirection('expense')}
        >
          <Text style={direction === 'expense' ? styles.directionTextActive : styles.directionText}>
            Gider
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[typeScale.label, { marginBottom: spacing.sm }]}>TÜR</Text>
      <View style={styles.typeWrap}>
        {TYPES.map((t) => (
          <TouchableOpacity
            key={t.value}
            style={[styles.typeChip, entryType === t.value && styles.typeChipActive]}
            onPress={() => setEntryType(t.value)}
          >
            <Text style={entryType === t.value ? styles.chipTextActive : styles.chipText}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextField
        label="Başlık *"
        value={title}
        onChangeText={setTitle}
        placeholder="örn. Çimento Bayii Çeki"
      />
      <TextField
        label="Tutar (TL) *"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="örn. 150000"
      />
      <TextField
        label="Vade Tarihi *"
        value={dueDate}
        onChangeText={setDueDate}
        placeholder="YYYY-AA-GG"
      />

      <View style={styles.interestToggle}>
        <View style={{ flex: 1 }}>
          <Text style={typeScale.label}>GECİKME FAİZİ UYGULA</Text>
          <Text style={styles.interestHint}>
            Vade geçtiğinde her gün faiz işler (basit faiz, anapara üzerinden)
          </Text>
        </View>
        <Switch
          value={applyInterest}
          onValueChange={setApplyInterest}
          trackColor={{ false: colors.hairline, true: colors.accent }}
          thumbColor={colors.paperElevated}
        />
      </View>

      {applyInterest && (
        <TextField
          label="Günlük Faiz Oranı (%)"
          value={interestPercent}
          onChangeText={setInterestPercent}
          keyboardType="decimal-pad"
          placeholder="0.14"
        />
      )}

      <TextField label="Not" value={notes} onChangeText={setNotes} placeholder="opsiyonel" multiline />

      <Button label="Kaydet" onPress={handleCreate} isLoading={isSubmitting} style={styles.submitButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: 60, backgroundColor: colors.paper },
  title: { marginBottom: spacing.lg },
  directionRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  directionOption: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  directionIncomeActive: { borderColor: colors.statusAvailable, backgroundColor: colors.statusAvailable },
  directionExpenseActive: { borderColor: colors.danger, backgroundColor: colors.danger },
  directionText: { fontFamily: fonts.displayMedium, color: colors.ink },
  directionTextActive: { fontFamily: fonts.displayMedium, color: colors.paper },
  typeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  typeChip: {
    borderWidth: 1.5,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  typeChipActive: { borderColor: colors.ink, backgroundColor: colors.ink },
  chipText: { fontFamily: fonts.label, fontSize: 12, color: colors.ink, letterSpacing: 0.6 },
  chipTextActive: { fontFamily: fonts.label, fontSize: 12, color: colors.paper, letterSpacing: 0.6 },
  interestToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.hairline,
  },
  interestHint: { ...typeScale.bodyMuted, fontSize: 12, marginTop: 2, lineHeight: 16 },
  submitButton: { marginTop: spacing.sm },
});
