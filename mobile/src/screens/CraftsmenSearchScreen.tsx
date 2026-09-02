import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchCraftsmen } from '../api/craftsmen';
import { CraftsmanProfile } from '../types/craftsman';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';

export default function CraftsmenSearchScreen({ navigation }: any) {
  const [craftsmen, setCraftsmen] = useState<CraftsmanProfile[]>([]);
  const [province, setProvince] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function load(filterProvince?: string) {
    try {
      const data = await fetchCraftsmen(
        filterProvince ? { province: filterProvince } : undefined,
      );
      setCraftsmen(data);
    } catch (error) {
      Alert.alert('Hata', 'Ustalar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load(province || undefined);
    }, []),
  );

  return (
    <View style={styles.container}>
      <Text style={typeScale.label}>TAŞERON</Text>
      <Text style={[typeScale.display, styles.title]}>Usta Ara</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={province}
          onChangeText={setProvince}
          placeholder="İl ile filtrele"
          placeholderTextColor={colors.inkMuted}
          onSubmitEditing={() => load(province || undefined)}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => load(province || undefined)}>
          <Text style={styles.searchButtonText}>ARA</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={craftsmen}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => load(province || undefined)}
            tintColor={colors.ink}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[typeScale.bodyMuted, styles.emptyText]}>
              {province ? `${province} için kayıtlı usta bulunamadı.` : 'Kayıtlı usta yok.'}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('CraftsmanDetail', { craftsmanId: item.id })}
          >
            <View style={styles.rowLeft}>
              <Text style={styles.specialty}>
                {item.specialtySummary || 'Uzmanlık belirtilmemiş'}
              </Text>
              <Text style={typeScale.bodyMuted}>
                {item.companyName ? `${item.companyName} · ` : ''}
                {[item.district, item.province].filter(Boolean).join(', ') || 'Bölge yok'}
                {item.yearsOfExperience ? ` · ${item.yearsOfExperience} yıl` : ''}
              </Text>
            </View>
            <View style={styles.ratingBox}>
              <Text style={styles.rating}>
                {item.reviewCount > 0 ? parseFloat(item.averageRating).toFixed(1) : '—'}
              </Text>
              <Text style={styles.reviewCount}>
                {item.reviewCount > 0 ? `${item.reviewCount} yorum` : 'yeni'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg, paddingTop: 60 },
  title: { marginBottom: spacing.md },
  searchRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.ink,
  },
  searchButton: {
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  searchButtonText: { fontFamily: fonts.label, fontSize: 12, color: colors.ink, letterSpacing: 0.8 },
  emptyText: { paddingVertical: spacing.xl, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    gap: spacing.md,
  },
  rowLeft: { flex: 1, gap: 2 },
  specialty: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.ink },
  ratingBox: { alignItems: 'flex-end' },
  rating: { fontFamily: fonts.display, fontSize: 18, color: colors.accent },
  reviewCount: { ...typeScale.bodyMuted, fontSize: 11 },
});
