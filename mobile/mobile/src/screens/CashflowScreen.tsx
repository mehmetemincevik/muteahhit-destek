import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchCashflowEntries } from '../api/cashflow';
import { CashflowEntry } from '../types/cashflow';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { formatCurrency, formatDate } from '../utils/format';

const TYPE_LABELS: Record<string, string> = {
  check: 'Çek',
  rent: 'Kira',
  installment_payment: 'Taksit',
  other: 'Diğer',
};

// Vadeye kalan gün. Negatif değer gecikmeyi ifade eder.
// Saat bileşeni sıfırlanarak gün farkı hesaplanıyor.
function daysUntil(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function CashflowScreen({ navigation }: any) {
  const [entries, setEntries] = useState<CashflowEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    try {
      const data = await fetchCashflowEntries();
      setEntries(data);
    } catch (error) {
      Alert.alert('Hata', 'Takvim yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  // Yalnızca ödenmemiş kayıtlar toplanır. Tutarlar currentAmount üzerinden alınır,
  // yani işlemiş gecikme faizi dahildir.
  const pending = entries.filter((e) => e.status !== 'paid');
  const incomeTotal = pending
    .filter((e) => e.direction === 'income')
    .reduce((sum, e) => sum + parseFloat(e.currentAmount), 0);
  const expenseTotal = pending
    .filter((e) => e.direction === 'expense')
    .reduce((sum, e) => sum + parseFloat(e.currentAmount), 0);
  const overdueCount = pending.filter((e) => e.status === 'overdue').length;

  return (
    <View style={styles.container}>
      <Text style={typeScale.label}>NAKİT AKIŞI</Text>
      <Text style={[typeScale.display, styles.title]}>Takvim</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={typeScale.label}>BEKLEYEN GELİR</Text>
          <Text style={[styles.summaryValue, { color: colors.statusAvailable }]}>
            {formatCurrency(incomeTotal)}
          </Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={typeScale.label}>BEKLEYEN GİDER</Text>
          <Text style={[styles.summaryValue, { color: colors.danger }]}>
            {formatCurrency(expenseTotal)}
          </Text>
        </View>
      </View>

      {overdueCount > 0 && (
        <View style={styles.overdueWarning}>
          <Text style={styles.overdueWarningText}>
            {overdueCount} kayıt gecikmiş — faiz işliyor
          </Text>
        </View>
      )}

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={colors.ink} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={typeScale.body}>Takvimde kayıt yok.</Text>
              <Text style={typeScale.bodyMuted}>Çek, taksit ya da kira kaydı ekle.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const remaining = daysUntil(item.dueDate);
          const isPaid = item.status === 'paid';
          const isOverdue = item.status === 'overdue';
          const hasInterest = parseFloat(item.currentAmount) > parseFloat(item.originalAmount);

          return (
            <TouchableOpacity
              style={styles.entryRow}
              onPress={() => navigation.navigate('CashflowEntryDetail', { entryId: item.id })}
            >
              {/* Durum şeridi: ödendi / gecikti / gelir / gider */}
              <View
                style={[
                  styles.statusStripe,
                  {
                    backgroundColor: isPaid
                      ? colors.hairline
                      : isOverdue
                        ? colors.danger
                        : item.direction === 'income'
                          ? colors.statusAvailable
                          : colors.accent,
                  },
                ]}
              />

              <View style={styles.entryContent}>
                <View style={styles.entryTop}>
                  <Text style={[styles.entryTitle, isPaid && styles.entryTitlePaid]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.entryAmount,
                      isPaid && styles.entryTitlePaid,
                      !isPaid && {
                        color: item.direction === 'income' ? colors.statusAvailable : colors.danger,
                      },
                    ]}
                  >
                    {item.direction === 'income' ? '+' : '−'}
                    {formatCurrency(item.currentAmount)}
                  </Text>
                </View>

                <View style={styles.entryBottom}>
                  <Text style={typeScale.bodyMuted}>
                    {TYPE_LABELS[item.entryType]} · {formatDate(item.dueDate)}
                  </Text>
                  {isPaid ? (
                    <Text style={styles.paidLabel}>ÖDENDİ</Text>
                  ) : isOverdue ? (
                    <Text style={styles.overdueLabel}>{Math.abs(remaining)} GÜN GECİKTİ</Text>
                  ) : remaining <= 7 ? (
                    <Text style={styles.soonLabel}>{remaining} GÜN KALDI</Text>
                  ) : null}
                </View>

                {/* Faiz işlemişse anapara ve faiz ayrı gösterilir */}
                {hasInterest && !isPaid && (
                  <Text style={styles.interestNote}>
                    Anapara {formatCurrency(item.originalAmount)} + faiz{' '}
                    {formatCurrency(
                      parseFloat(item.currentAmount) - parseFloat(item.originalAmount),
                    )}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateCashflowEntry')}>
        <Text style={styles.fabText}>+ Kayıt Ekle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg, paddingTop: 60 },
  title: { marginBottom: spacing.lg },
  summaryRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  summaryBox: {
    flex: 1,
    backgroundColor: colors.paperElevated,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  summaryValue: { fontFamily: fonts.displayMedium, fontSize: 16 },
  overdueWarning: {
    backgroundColor: colors.dangerBg,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  overdueWarningText: { fontFamily: fonts.label, fontSize: 12, color: colors.danger, letterSpacing: 0.6 },
  empty: { paddingVertical: spacing.xl, gap: 4 },
  entryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  statusStripe: { width: 3, borderRadius: 2 },
  entryContent: { flex: 1, gap: 4 },
  entryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  entryTitle: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.ink, flex: 1 },
  entryTitlePaid: { color: colors.inkMuted, textDecorationLine: 'line-through' },
  entryAmount: { fontFamily: fonts.displayMedium, fontSize: 15, color: colors.ink },
  entryBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paidLabel: { fontFamily: fonts.label, fontSize: 10, color: colors.inkMuted, letterSpacing: 0.8 },
  overdueLabel: { fontFamily: fonts.label, fontSize: 10, color: colors.danger, letterSpacing: 0.8 },
  soonLabel: { fontFamily: fonts.label, fontSize: 10, color: colors.accent, letterSpacing: 0.8 },
  interestNote: { ...typeScale.bodyMuted, fontSize: 12, fontStyle: 'italic' },
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
