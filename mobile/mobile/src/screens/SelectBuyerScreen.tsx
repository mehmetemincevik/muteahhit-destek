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
import { fetchBuyers, updateUnitStatusRequest } from '../api/units';
import { Buyer } from '../types/unit';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';

// İki modda çalışır: unitId parametresiyle açıldığında seçim modu (daire satışı),
// parametresiz açıldığında salt görüntüleme modu.
export default function SelectBuyerScreen({ route, navigation }: any) {
  const unitId: string | undefined = route.params?.unitId;
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  async function load() {
    try {
      const data = await fetchBuyers();
      setBuyers(data);
    } catch (error) {
      Alert.alert('Hata', 'Alıcılar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  async function handleSelect(buyer: Buyer) {
    if (!unitId) return; // sadece listeleme modundaysa seçim yapılmaz

    setAssigningId(buyer.id);
    try {
      await updateUnitStatusRequest(unitId, { status: 'sold', buyerId: buyer.id });
      // İki ekran geri dönülür (SelectBuyer -> UnitDetail -> ProjectDetail).
      // UnitDetail'deki daire nesnesi route parametresiyle taşındığı için güncel
      // değil; ProjectDetail useFocusEffect ile listeyi yeniden çekiyor.
      navigation.pop(2);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Daire satıldı olarak işaretlenemedi';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setAssigningId(null);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={typeScale.label}>{unitId ? 'DAİREYİ SAT' : 'ALICILAR'}</Text>
      <Text style={[typeScale.display, styles.title]}>
        {unitId ? 'Alıcı Seç' : 'Alıcı Listesi'}
      </Text>

      {isLoading && <ActivityIndicator color={colors.ink} style={{ marginTop: spacing.xl }} />}

      <FlatList
        data={buyers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={typeScale.body}>Henüz kayıtlı alıcı yok.</Text>
              <Text style={typeScale.bodyMuted}>Aşağıdaki düğmeyle ilk alıcıyı ekle.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.buyerRow}
            onPress={() => handleSelect(item)}
            disabled={!unitId || assigningId !== null}
          >
            <View style={styles.buyerInfo}>
              <Text style={styles.buyerName}>{item.fullName}</Text>
              {item.phone && <Text style={typeScale.bodyMuted}>{item.phone}</Text>}
            </View>
            {assigningId === item.id ? (
              <ActivityIndicator color={colors.ink} />
            ) : unitId ? (
              <Text style={styles.selectText}>SEÇ</Text>
            ) : null}
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateBuyer', { unitId })}
      >
        <Text style={styles.fabText}>+ Yeni Alıcı</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg, paddingTop: 60 },
  title: { marginBottom: spacing.lg },
  empty: { paddingVertical: spacing.xl, gap: 4 },
  buyerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  buyerInfo: { gap: 2 },
  buyerName: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.ink },
  selectText: { fontFamily: fonts.label, fontSize: 12, color: colors.accent, letterSpacing: 1 },
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
