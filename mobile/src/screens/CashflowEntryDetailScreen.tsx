import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchCashflowEntryDetail, markEntryAsPaidRequest } from '../api/cashflow';
import { CashflowEntryDetail } from '../types/cashflow';
import { Button } from '../components/Button';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { formatCurrency, formatDate } from '../utils/format';

const TYPE_LABELS: Record<string, string> = {
  check: 'Çek',
  rent: 'Kira',
  installment_payment: 'Taksit',
  other: 'Diğer',
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CashflowEntryDetailScreen({ route, navigation }: any) {
  const { entryId } = route.params;
  const [detail, setDetail] = useState<CashflowEntryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  async function load() {
    try {
      const data = await fetchCashflowEntryDetail(entryId);
      setDetail(data);
    } catch (error) {
      Alert.alert('Hata', 'Kayıt yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [entryId]),
  );

  function confirmMarkPaid() {
    if (!detail) return;
    const amount = formatCurrency(detail.entry.currentAmount);
    Alert.alert(
      'Ödendi olarak işaretle',
      `${amount} tutarında bir ödeme kaydı oluşturulacak. Onaylıyor musun?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Onayla', onPress: handleMarkPaid },
      ],
    );
  }

  async function handleMarkPaid() {
    setIsMarkingPaid(true);
    try {
      await markEntryAsPaidRequest(entryId, { paidDate: todayISO() });
      await load();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'İşlem başarısız';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setIsMarkingPaid(false);
    }
  }

  if (isLoading || !detail) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  const { entry, accruals } = detail;
  const totalInterest = parseFloat(entry.currentAmount) - parseFloat(entry.originalAmount);
  const isPaid = entry.status === 'paid';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={typeScale.label}>
        {TYPE_LABELS[entry.entryType]} · {entry.direction === 'income' ? 'GELİR' : 'GİDER'}
      </Text>
      <Text style={[typeScale.display, styles.title]}>{entry.title}</Text>

      <View style={styles.amountCard}>
        <Text style={styles.currentAmount}>{formatCurrency(entry.currentAmount)}</Text>
        <Text style={typeScale.label}>
          {totalInterest > 0 ? 'GÜNCEL TUTAR (FAİZ DAHİL)' : 'TUTAR'}
        </Text>

        {totalInterest > 0 && (
          <View style={styles.breakdown}>
            <View style={styles.breakdownRow}>
              <Text style={typeScale.bodyMuted}>Anapara</Text>
              <Text style={typeScale.body}>{formatCurrency(entry.originalAmount)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={typeScale.bodyMuted}>İşlemiş faiz</Text>
              <Text style={[typeScale.body, { color: colors.danger }]}>
                +{formatCurrency(totalInterest)}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        <InfoRow label="VADE TARİHİ" value={formatDate(entry.dueDate)} />
        <InfoRow
          label="DURUM"
          value={
            isPaid
              ? `Ödendi (${formatDate(entry.paidDate)})`
              : entry.status === 'overdue'
                ? 'Gecikmiş'
                : 'Bekliyor'
          }
          danger={entry.status === 'overdue'}
        />
        {entry.dailyInterestRate && !isPaid && (
          <InfoRow
            label="GÜNLÜK FAİZ ORANI"
            value={`%${(parseFloat(entry.dailyInterestRate) * 100).toFixed(2)}`}
          />
        )}
        {entry.notes && <InfoRow label="NOT" value={entry.notes} />}
      </View>

      {!isPaid && (
        <Button
          label="Ödendi Olarak İşaretle"
          onPress={confirmMarkPaid}
          isLoading={isMarkingPaid}
          style={{ marginBottom: spacing.xl }}
        />
      )}

      {/* Günlük faiz geçmişi -- her gün ayrı bir kayıt, geçmiş asla silinmiyor.
          Bu şeffaflık için önemli: müteahhit tam olarak hangi gün ne kadar faiz
          işlediğini görebiliyor. */}
      {accruals.length > 0 && (
        <>
          <View style={styles.listHeader}>
            <Text style={typeScale.label}>FAİZ GEÇMİŞİ</Text>
            <View style={styles.headerLine} />
          </View>

          {accruals.map((accrual) => (
            <View key={accrual.id} style={styles.accrualRow}>
              <Text style={typeScale.bodyMuted}>{formatDate(accrual.accrualDate)}</Text>
              <View style={styles.accrualRight}>
                <Text style={styles.accrualAmount}>+{formatCurrency(accrual.interestAmount)}</Text>
                <Text style={styles.accrualBalance}>→ {formatCurrency(accrual.balanceAfter)}</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={typeScale.label}>{label}</Text>
      <Text style={[typeScale.body, danger && { color: colors.danger }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.paper,
  },
  container: { flexGrow: 1, backgroundColor: colors.paper, padding: spacing.lg, paddingTop: 60 },
  title: { marginBottom: spacing.lg },
  amountCard: {
    backgroundColor: colors.paperElevated,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  currentAmount: { fontFamily: fonts.display, fontSize: 30, color: colors.ink },
  breakdown: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    gap: spacing.xs,
  },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoSection: { gap: spacing.md, marginBottom: spacing.xl },
  infoRow: { gap: 4, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  listHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  headerLine: { flex: 1, height: 1, backgroundColor: colors.hairline },
  accrualRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  accrualRight: { alignItems: 'flex-end' },
  accrualAmount: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.danger },
  accrualBalance: { ...typeScale.bodyMuted, fontSize: 12 },
});
