import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchAssets } from '../api/assets';
import { Asset, AssetType } from '../types/asset';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { formatCurrency } from '../utils/format';

const TYPE_LABELS: Record<AssetType, string> = {
  cash: 'NAKİT',
  commodity: 'EMTİA',
  real_estate: 'GAYRİMENKUL',
  other: 'DİĞER',
};

// Bölümler sabit sırayla gösterilir; boş olanlar listeden çıkarılır.
const TYPE_ORDER: AssetType[] = ['cash', 'commodity', 'real_estate', 'other'];

export default function AssetsScreen({ navigation }: any) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    try {
      const data = await fetchAssets();
      setAssets(data);
    } catch (error) {
      Alert.alert('Hata', 'Varlıklar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const total = assets.reduce((sum, a) => sum + parseFloat(a.currentValue), 0);

  const sections = TYPE_ORDER.map((type) => ({
    type,
    title: TYPE_LABELS[type],
    data: assets.filter((a) => a.assetType === type),
  })).filter((section) => section.data.length > 0);

  return (
    <View style={styles.container}>
      <Text style={typeScale.label}>VARLIKLAR</Text>
      <Text style={styles.total}>{formatCurrency(total)}</Text>
      <Text style={[typeScale.bodyMuted, styles.totalCaption]}>
        {assets.length} kayıt · toplam değer
      </Text>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={load} tintColor={colors.ink} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={typeScale.body}>Henüz varlık kaydı yok.</Text>
              <Text style={typeScale.bodyMuted}>
                Nakit, emtia veya gayrimenkul ekleyerek başlayın.
              </Text>
            </View>
          ) : null
        }
        renderSectionHeader={({ section }) => {
          const sectionTotal = section.data.reduce(
            (sum, a) => sum + parseFloat(a.currentValue),
            0,
          );
          return (
            <View style={styles.sectionHeader}>
              <Text style={typeScale.label}>{section.title}</Text>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionTotal}>{formatCurrency(sectionTotal)}</Text>
            </View>
          );
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.assetRow}
            onPress={() => navigation.navigate('AssetDetail', { assetId: item.id })}
          >
            <View style={styles.assetLeft}>
              <Text style={styles.assetName}>{item.name}</Text>
              <Text style={typeScale.bodyMuted}>
                {item.assetType === 'real_estate'
                  ? [item.district, item.province].filter(Boolean).join(', ') || 'Konum girilmemiş'
                  : item.description || '—'}
              </Text>
            </View>
            <View style={styles.assetRight}>
              <Text style={styles.assetValue}>{formatCurrency(item.currentValue)}</Text>
              {item.isGeneratingRentalIncome && <Text style={styles.rentBadge}>KİRADA</Text>}
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateAsset')}>
        <Text style={styles.fabText}>+ Varlık Ekle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg, paddingTop: 60 },
  total: { fontFamily: fonts.display, fontSize: 32, color: colors.ink, marginTop: spacing.xs },
  totalCaption: { marginBottom: spacing.lg },
  empty: { paddingVertical: spacing.xl, gap: 4 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.paper,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.hairline },
  sectionTotal: { fontFamily: fonts.label, fontSize: 12, color: colors.inkMuted, letterSpacing: 0.6 },
  assetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    gap: spacing.md,
  },
  assetLeft: { flex: 1, gap: 2 },
  assetName: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.ink },
  assetRight: { alignItems: 'flex-end', gap: 2 },
  assetValue: { fontFamily: fonts.displayMedium, fontSize: 15, color: colors.ink },
  rentBadge: {
    fontFamily: fonts.label,
    fontSize: 9,
    color: colors.statusAvailable,
    letterSpacing: 0.8,
  },
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
