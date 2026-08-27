import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Unit } from '../types/unit';
import { updateUnitStatusRequest } from '../api/units';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typeScale, fonts } from '../theme/tokens';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={typeScale.label}>{label}</Text>
      <Text style={typeScale.body}>{value}</Text>
    </View>
  );
}

export default function UnitDetailScreen({ route, navigation }: any) {
  const initialUnit: Unit = route.params.unit;
  const { user } = useAuth();
  const [unit, setUnit] = useState<Unit>(initialUnit);
  const [isUpdating, setIsUpdating] = useState(false);

  async function markAvailable() {
    setIsUpdating(true);
    try {
      const updated = await updateUnitStatusRequest(unit.id, { status: 'available' });
      setUnit(updated);
    } catch (error) {
      Alert.alert('Hata', 'Durum güncellenemedi');
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={typeScale.label}>DAİRE DETAYI</Text>
      <Text style={[typeScale.display, styles.title]}>
        Kat {unit.floorNo} · No {unit.unitNo}
      </Text>

      <StatusBadge status={unit.ownershipStatus} />

      <View style={styles.details}>
        {unit.roomLayout && <DetailRow label="ODA TİPİ" value={unit.roomLayout} />}
        {unit.grossM2 != null && <DetailRow label="BRÜT M²" value={String(unit.grossM2)} />}
        {unit.salePrice != null && (
          <DetailRow label="SATIŞ FİYATI" value={`${Number(unit.salePrice).toLocaleString('tr-TR')} TL`} />
        )}
        {unit.estimatedSaleValue != null && (
          <DetailRow
            label="TAHMİNİ DEĞER"
            value={`${Number(unit.estimatedSaleValue).toLocaleString('tr-TR')} TL`}
          />
        )}
      </View>

      {user?.role === 'contractor' && (
        <Button
          label="Tahsilat / Ödemeler →"
          variant="ghost"
          onPress={() =>
            navigation.navigate('Payments', {
              unitId: unit.id,
              unitLabel: `KAT ${unit.floorNo} · NO ${unit.unitNo}`,
            })
          }
          style={{ marginTop: spacing.lg }}
        />
      )}

      {user?.role === 'contractor' && (
        <View style={styles.actions}>
          <Text style={[typeScale.label, { marginBottom: spacing.sm }]}>DURUM DEĞİŞTİR</Text>

          {unit.ownershipStatus !== 'sold' && (
            <Button
              label="Satıldı Olarak İşaretle"
              onPress={() => navigation.navigate('SelectBuyer', { unitId: unit.id })}
              style={{ marginBottom: spacing.sm }}
            />
          )}

          {unit.ownershipStatus !== 'available' && (
            <Button label="Boşta Olarak İşaretle" variant="ghost" onPress={markAvailable} isLoading={isUpdating} />
          )}

          {/* NOT (bilinen sınırlama): "Arsa Sahibine Verildi" durumu için arsa sahibi seçme
              akışı henüz yok -- arsa sahipleri proje oluştururken giriliyor ama onları
              listeleyip seçtiren bir ekran eklenmedi. Bu, doğal bir sonraki adım. */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg, paddingTop: 60 },
  title: { marginTop: spacing.xs, marginBottom: spacing.md },
  details: { marginTop: spacing.xl, gap: spacing.md },
  row: { gap: 4, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  actions: { marginTop: spacing.xl },
});
