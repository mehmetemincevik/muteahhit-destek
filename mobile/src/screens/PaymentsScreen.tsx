import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchPayments, fetchUnitBalance } from '../api/payments';
import { Payment, UnitPaymentSummary } from '../types/payment';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { formatCurrency, formatDate } from '../utils/format';

const METHOD_LABELS: Record<string, string> = {
  cash: 'Nakit',
  bank_transfer: 'Havale/EFT',
  check: 'Çek',
  other: 'Diğer',
};

export default function PaymentsScreen({ route, navigation }: any) {
  const { unitId, unitLabel } = route.params;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<UnitPaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    try {
      // İki isteği paralel atıyoruz -- biri bitince diğerini beklemek yerine
      // ikisini aynı anda başlatmak ekranın daha hızlı dolmasını sağlıyor.
      const [paymentsData, summaryData] = await Promise.all([
        fetchPayments(unitId),
        fetchUnitBalance(unitId),
      ]);
      setPayments(paymentsData);
      setSummary(summaryData);
    } catch (error) {
      Alert.alert('Hata', 'Ödeme bilgileri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [unitId]),
  );

  const salePrice = summary?.sale_price ? parseFloat(summary.sale_price) : 0;
  const totalPaid = summary?.total_paid ? parseFloat(summary.total_paid) : 0;
  const remaining = summary?.remaining_balance ? parseFloat(summary.remaining_balance) : 0;
  // Satış fiyatı girilmemişse yüzde hesaplanamaz -- 0'a bölme hatasından kaçınıyoruz
  const paidRatio = salePrice > 0 ? Math.min(totalPaid / salePrice, 1) : 0;
  const isOverpaid = salePrice > 0 && totalPaid > salePrice;

  return (
    <View style={styles.container}>
      <Text style={typeScale.label}>{unitLabel}</Text>
      <Text style={[typeScale.display, styles.title]}>Tahsilat</Text>

      {isLoading && <ActivityIndicator color={colors.ink} style={{ marginTop: spacing.xl }} />}

      {summary && (
        <View style={styles.summaryCard}>
          {salePrice > 0 ? (
            <>
              {/* Tahsilat ilerleme çubuğu -- ne kadarının tahsil edildiğini tek bakışta gösterir */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${paidRatio * 100}%` }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressPercent}>{Math.round(paidRatio * 100)}% tahsil edildi</Text>
                {isOverpaid && <Text style={styles.overpaidBadge}>FAZLA ÖDEME</Text>}
              </View>
            </>
          ) : (
            <Text style={[typeScale.bodyMuted, { marginBottom: spacing.md }]}>
              Bu daire için satış fiyatı girilmemiş — bakiye hesaplanamıyor.
            </Text>
          )}

          <View style={styles.figures}>
            <Figure label="SATIŞ FİYATI" value={formatCurrency(summary.sale_price)} />
            <Figure label="TAHSİL EDİLEN" value={formatCurrency(summary.total_paid)} accent />
            <Figure
              label="KALAN"
              value={formatCurrency(summary.remaining_balance)}
              danger={remaining > 0}
            />
          </View>
        </View>
      )}

      <View style={styles.listHeader}>
        <Text style={typeScale.label}>ÖDEME GEÇMİŞİ</Text>
        <View style={styles.headerLine} />
      </View>

      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[typeScale.bodyMuted, { paddingVertical: spacing.lg }]}>
              Henüz ödeme kaydı yok.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.paymentRow}>
            <View style={styles.paymentLeft}>
              <Text style={styles.paymentAmount}>{formatCurrency(item.amount)}</Text>
              <Text style={typeScale.bodyMuted}>
                {formatDate(item.paymentDate)}
                {item.paymentMethod ? ` · ${METHOD_LABELS[item.paymentMethod]}` : ''}
              </Text>
              {item.note && <Text style={styles.paymentNote}>{item.note}</Text>}
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePayment', { unitId, unitLabel })}
      >
        <Text style={styles.fabText}>+ Ödeme Ekle</Text>
      </TouchableOpacity>
    </View>
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
  container: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg, paddingTop: 60 },
  title: { marginBottom: spacing.lg },
  summaryCard: {
    backgroundColor: colors.paperElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    marginBottom: spacing.lg,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.hairline,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.statusAvailable },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  progressPercent: { fontFamily: fonts.label, fontSize: 12, color: colors.inkMuted, letterSpacing: 0.8 },
  overpaidBadge: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: colors.danger,
    backgroundColor: colors.dangerBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    letterSpacing: 0.8,
  },
  figures: { gap: spacing.sm },
  figure: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  figureValue: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.ink },
  listHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  headerLine: { flex: 1, height: 1, backgroundColor: colors.hairline },
  paymentRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  paymentLeft: { gap: 2 },
  paymentAmount: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.ink },
  paymentNote: { ...typeScale.bodyMuted, fontSize: 13, fontStyle: 'italic', marginTop: 2 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: spacing.lg,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
  },
  fabText: { fontFamily: fonts.displayMedium, color: colors.accentInk },
});
