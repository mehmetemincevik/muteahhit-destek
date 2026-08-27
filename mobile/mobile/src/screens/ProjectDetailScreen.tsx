import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchBlocks } from '../api/units';
import { Block, Unit } from '../types/unit';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { statusColor } from '../components/StatusBadge';

// Daireleri kata göre gruplar ve üst kat en üstte olacak şekilde sıralar; bina
// kesiti düzeninde gösterim için gerekli.
//
// Sınırlama: yalnızca içinde daire bulunan katlar döner. blocks.floorCount değerine
// rağmen boş katlar listede yer almaz.
// TODO: floorCount'a göre boş katları da çizip "daire ekle" hedefi haline getirmek.
function groupUnitsByFloor(units: Unit[]): { floorNo: number; units: Unit[] }[] {
  const map = new Map<number, Unit[]>();
  for (const unit of units) {
    const list = map.get(unit.floorNo) ?? [];
    list.push(unit);
    map.set(unit.floorNo, list);
  }
  return Array.from(map.entries())
    .map(([floorNo, floorUnits]) => ({ floorNo, units: floorUnits }))
    .sort((a, b) => b.floorNo - a.floorNo);
}

export default function ProjectDetailScreen({ route, navigation }: any) {
  const { projectId, projectName } = route.params;
  const { user } = useAuth();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    try {
      const data = await fetchBlocks(projectId);
      setBlocks(data);
    } catch (error) {
      Alert.alert('Hata', 'Bloklar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [projectId]),
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={typeScale.label}>PROJE</Text>
      <Text style={[typeScale.display, styles.title]}>{projectName}</Text>

      {user?.role === 'contractor' && (
        <TouchableOpacity
          style={styles.costsLink}
          onPress={() => navigation.navigate('Costs', { projectId, projectName })}
        >
          <Text style={styles.costsLinkText}>MALİYETLER →</Text>
        </TouchableOpacity>
      )}

      {isLoading && <ActivityIndicator color={colors.ink} style={{ marginTop: spacing.xl }} />}

      {!isLoading && blocks.length === 0 && (
        <View style={styles.empty}>
          <Text style={typeScale.body}>Henüz blok eklenmemiş.</Text>
        </View>
      )}

      {blocks.map((block) => {
        const floors = groupUnitsByFloor(block.units ?? []);
        return (
          <View key={block.id} style={styles.blockSection}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockName}>{block.name}</Text>
              {user?.role === 'contractor' && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('CreateUnit', { blockId: block.id, blockName: block.name })}
                >
                  <Text style={styles.addUnitText}>+ Daire</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Kat kesiti: her satır bir kat, her hücre bir daire */}
            <View style={styles.elevation}>
              {floors.length === 0 && (
                <Text style={[typeScale.bodyMuted, { paddingVertical: spacing.sm }]}>
                  Bu blokta henüz daire yok
                </Text>
              )}
              {floors.map(({ floorNo, units }) => (
                <View key={floorNo} style={styles.floorRow}>
                  <Text style={styles.floorLabel}>K{floorNo}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
                    {units
                      .sort((a, b) => a.unitNo.localeCompare(b.unitNo))
                      .map((unit) => {
                        const color = statusColor(unit.ownershipStatus);
                        return (
                          <TouchableOpacity
                            key={unit.id}
                            style={[styles.unitCell, { borderColor: color, backgroundColor: color + '1A' }]}
                            onPress={() => navigation.navigate('UnitDetail', { unit })}
                          >
                            <Text style={[styles.unitCellText, { color }]}>{unit.unitNo}</Text>
                          </TouchableOpacity>
                        );
                      })}
                  </ScrollView>
                </View>
              ))}
            </View>
          </View>
        );
      })}

      {user?.role === 'contractor' && (
        <TouchableOpacity
          style={styles.addBlockButton}
          onPress={() => navigation.navigate('CreateBlock', { projectId })}
        >
          <Text style={styles.addBlockText}>+ Yeni Blok Ekle</Text>
        </TouchableOpacity>
      )}

      {/* Izgaradaki renk kodlarının karşılığı */}
      <View style={styles.legend}>
        <LegendItem color={colors.statusAvailable} label="Boşta" />
        <LegendItem color={colors.statusSold} label="Satıldı" />
        <LegendItem color={colors.statusGiven} label="Arsa Sahibine Verildi" />
      </View>
    </ScrollView>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={typeScale.bodyMuted}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  content: { padding: spacing.lg, paddingTop: 60, paddingBottom: spacing.xxl },
  title: { marginBottom: spacing.lg },
  costsLink: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  costsLinkText: { fontFamily: fonts.label, fontSize: 12, color: colors.ink, letterSpacing: 0.8 },
  empty: { paddingVertical: spacing.xl },
  blockSection: { marginBottom: spacing.xl },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  blockName: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.ink },
  addUnitText: { fontFamily: fonts.label, fontSize: 12, color: colors.ink, letterSpacing: 0.6 },
  elevation: { gap: 6 },
  floorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  floorLabel: { fontFamily: fonts.label, fontSize: 11, color: colors.inkMuted, width: 28 },
  unitScroll: { flex: 1 },
  unitCell: {
    borderWidth: 1.5,
    borderRadius: radius.sm,
    minWidth: 48,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    paddingHorizontal: 6,
  },
  unitCellText: { fontFamily: fonts.displayMedium, fontSize: 13 },
  addBlockButton: {
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  addBlockText: { fontFamily: fonts.displayMedium, color: colors.ink },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xl },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
});
