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
import { fetchCostItems, fetchProjectCostSummary } from '../api/costs';
import { CostItem, ProjectCostSummaryRow } from '../types/cost';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { formatCurrency } from '../utils/format';

export default function CostsScreen({ route, navigation }: any) {
  const { projectId, projectName } = route.params;
  const [items, setItems] = useState<CostItem[]>([]);
  const [summary, setSummary] = useState<ProjectCostSummaryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    try {
      const [itemsData, summaryData] = await Promise.all([
        fetchCostItems(projectId),
        fetchProjectCostSummary(projectId),
      ]);
      setItems(itemsData);
      setSummary(summaryData);
    } catch (error) {
      Alert.alert('Hata', 'Maliyet bilgileri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [projectId]),
  );

  // Sabit ve değişken maliyetler ayrı toplanır. Sabit kalemler baştan bellidir,
  // değişkenler piyasa fiyatına bağlı olarak güncellenir.
  const fixedTotal = summary
    .filter((row) => row.cost_type === 'fixed')
    .reduce((sum, row) => sum + parseFloat(row.category_total), 0);
  const variableTotal = summary
    .filter((row) => row.cost_type === 'variable')
    .reduce((sum, row) => sum + parseFloat(row.category_total), 0);
  const grandTotal = fixedTotal + variableTotal;
  const fixedRatio = grandTotal > 0 ? fixedTotal / grandTotal : 0;

  return (
    <View style={styles.container}>
      <Text style={typeScale.label}>{projectName}</Text>
      <Text style={[typeScale.display, styles.title]}>Maliyetler</Text>

      {isLoading && <ActivityIndicator color={colors.ink} style={{ marginTop: spacing.xl }} />}

      {!isLoading && grandTotal > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.grandTotal}>{formatCurrency(grandTotal)}</Text>
          <Text style={[typeScale.label, { marginBottom: spacing.md }]}>TOPLAM MALİYET</Text>

          {/* Sabit / değişken dağılımı */}
          <View style={styles.splitBar}>
            <View style={[styles.splitFixed, { flex: fixedRatio || 0.0001 }]} />
            <View style={[styles.splitVariable, { flex: 1 - fixedRatio || 0.0001 }]} />
          </View>
          <View style={styles.splitLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.ink }]} />
              <Text style={typeScale.bodyMuted}>Sabit {formatCurrency(fixedTotal)}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
              <Text style={typeScale.bodyMuted}>Değişken {formatCurrency(variableTotal)}</Text>
            </View>
          </View>

          {/* Kategori bazlı kırılım */}
          <View style={styles.categoryBreakdown}>
            {summary.map((row, idx) => (
              <View key={`${row.category_name}-${idx}`} style={styles.categoryRow}>
                <View style={styles.categoryLeft}>
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: row.cost_type === 'fixed' ? colors.ink : colors.accent },
                    ]}
                  />
                  <Text style={typeScale.body}>{row.category_name}</Text>
                </View>
                <Text style={styles.categoryTotal}>{formatCurrency(row.category_total)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.listHeader}>
        <Text style={typeScale.label}>KALEMLER</Text>
        <View style={styles.headerLine} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={typeScale.body}>Henüz maliyet kalemi yok.</Text>
              <Text style={typeScale.bodyMuted}>Sağ alttaki düğmeyle ilk kalemi ekle.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemRow}
            onPress={() => navigation.navigate('CostItemDetail', { costItem: item })}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={typeScale.bodyMuted}>
                {item.category?.name ?? '—'}
                {item.quantity && item.unit ? ` · ${parseFloat(item.quantity)} ${item.unit}` : ''}
              </Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.itemCost}>{formatCurrency(item.totalCost)}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateCostItem', { projectId, projectName })}
      >
        <Text style={styles.fabText}>+ Kalem Ekle</Text>
      </TouchableOpacity>
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
  grandTotal: { fontFamily: fonts.display, fontSize: 26, color: colors.ink },
  splitBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' },
  splitFixed: { backgroundColor: colors.ink },
  splitVariable: { backgroundColor: colors.accent },
  splitLegend: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  categoryBreakdown: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    gap: spacing.sm,
  },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  categoryDot: { width: 6, height: 6, borderRadius: 3 },
  categoryTotal: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.ink },
  listHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  headerLine: { flex: 1, height: 1, backgroundColor: colors.hairline },
  empty: { paddingVertical: spacing.xl, gap: 4 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  itemLeft: { gap: 2, flex: 1 },
  itemName: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.ink },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  itemCost: { fontFamily: fonts.displayMedium, fontSize: 15, color: colors.ink },
  chevron: { fontSize: 20, color: colors.inkMuted },
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
