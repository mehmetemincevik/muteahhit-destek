import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { createCostPaymentRequest, fetchCostItemBalance } from '../api/costs';
import { CostItem, CostItemPaymentSummary, CostPaymentMethod } from '../types/cost';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { DateField } from '../components/DateField';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { formatCurrency, parseAmount } from '../utils/format';

const METHODS: { value: CostPaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Nakit' },
  { value: 'bank_transfer', label: 'Havale' },
  { value: 'check', label: 'Çek' },
  { value: 'other', label: 'Diğer' },
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CostItemDetailScreen({ route }: any) {
  const costItem: CostItem = route.params.costItem;
  const [summary, setSummary] = useState<CostItemPaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ödeme formu ayrı ekran yerine aynı sayfada açılır; kısmi ödeme girilirken
  // kalan bakiyenin görünür kalması gerekiyor.
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(todayISO());
  const [method, setMethod] = useState<CostPaymentMethod>('bank_transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadBalance() {
    try {
      const data = await fetchCostItemBalance(costItem.id);
      setSummary(data);
    } catch (error) {
      Alert.alert('Hata', 'Bakiye bilgisi yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadBalance();
    }, [costItem.id]),
  );

  async function handleAddPayment() {
    const parsed = parseAmount(amount);
    if (parsed == null || parsed <= 0) {
      Alert.alert('Geçersiz tutar', 'Sıfırdan büyük bir tutar gir');
      return;
    }
    if (!paymentDate) {
      Alert.alert('Eksik bilgi', 'Ödeme tarihi seçin');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCostPaymentRequest(costItem.id, {
        amount: parsed,
        paymentDate,
        paymentMethod: method,
      });
      setAmount('');
      setShowForm(false);
      await loadBalance(); // bakiyeyi tazele
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Ödeme kaydedilemedi';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalCost = summary ? parseFloat(summary.total_cost) : 0;
  const totalPaid = summary ? parseFloat(summary.total_paid) : 0;
  const paidRatio = totalCost > 0 ? Math.min(totalPaid / totalCost, 1) : 0;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={typeScale.label}>{costItem.category?.name ?? 'MALİYET KALEMİ'}</Text>
      <Text style={[typeScale.display, styles.title]}>{costItem.name}</Text>

      {costItem.quantity && costItem.unit && (
        <Text style={[typeScale.bodyMuted, { marginBottom: spacing.md }]}>
          {parseFloat(costItem.quantity)} {costItem.unit}
          {costItem.unitPrice ? ` × ${formatCurrency(costItem.unitPrice)}` : ''}
        </Text>
      )}

      {isLoading && <ActivityIndicator color={colors.ink} />}

      {summary && (
        <View style={styles.summaryCard}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${paidRatio * 100}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressPercent}>{Math.round(paidRatio * 100)}% ödendi</Text>
            {summary.is_fully_paid && <Text style={styles.paidBadge}>TAMAMEN ÖDENDİ</Text>}
          </View>

          <View style={styles.figures}>
            <Figure label="TOPLAM MALİYET" value={formatCurrency(summary.total_cost)} />
            <Figure label="ÖDENEN" value={formatCurrency(summary.total_paid)} accent />
            <Figure
              label="KALAN"
              value={formatCurrency(summary.remaining_balance)}
              danger={parseFloat(summary.remaining_balance) > 0}
            />
          </View>
        </View>
      )}

      {!showForm ? (
        <Button label="+ Ödeme Ekle" onPress={() => setShowForm(true)} />
      ) : (
        <View style={styles.form}>
          <Text style={[typeScale.label, { marginBottom: spacing.md }]}>YENİ ÖDEME</Text>

          <TextField
            label="Tutar (TL) *"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="örn. 100000"
          />
          <DateField label="Ödeme Tarihi *" value={paymentDate} onChange={setPaymentDate} />

          <Text style={[typeScale.label, { marginBottom: spacing.sm }]}>YÖNTEM</Text>
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

          <Button label="Kaydet" onPress={handleAddPayment} isLoading={isSubmitting} />
          <Button
            label="Vazgeç"
            variant="ghost"
            onPress={() => setShowForm(false)}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      )}
    </ScrollView>
  );
}

function Figure({
  label,
  value,
  accent,
  danger,
}: {
  label: string;
  value: string;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <View style={styles.figure}>
      <Text style={typeScale.label}>{label}</Text>
      <Text
        style={[
          styles.figureValue,
          accent && { color: colors.statusAvailable },
          danger && { color: colors.danger },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.paper, padding: spacing.lg, paddingTop: 60 },
  title: { marginBottom: spacing.xs },
  summaryCard: {
    backgroundColor: colors.paperElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    marginBottom: spacing.lg,
  },
  progressTrack: { height: 8, backgroundColor: colors.hairline, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.statusAvailable },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  progressPercent: { fontFamily: fonts.label, fontSize: 12, color: colors.inkMuted, letterSpacing: 0.8 },
  paidBadge: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: colors.statusAvailable,
    letterSpacing: 0.8,
  },
  figures: { gap: spacing.sm },
  figure: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  figureValue: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.ink },
  form: {
    backgroundColor: colors.paperElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
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
});
