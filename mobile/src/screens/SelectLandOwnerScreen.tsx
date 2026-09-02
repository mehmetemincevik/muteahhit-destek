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
import { addLandOwnerRequest, fetchLandOwners } from '../api/projects';
import { updateUnitStatusRequest } from '../api/units';
import { LandOwner } from '../types/project';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { parseAmount } from '../utils/format';

// Daireyi kat karşılığı olarak arsa sahibine devretmek için sahip seçilir.
// Sahipler proje oluşturulurken girilebilir; girilmemişse bu ekrandan da eklenebilir.
export default function SelectLandOwnerScreen({ route, navigation }: any) {
  const { projectId, unitId } = route.params;
  const [owners, setOwners] = useState<LandOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [sharePercentage, setSharePercentage] = useState('');
  const [tcOrVkn, setTcOrVkn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function load() {
    try {
      const data = await fetchLandOwners(projectId);
      setOwners(data);
    } catch (error) {
      Alert.alert('Hata', 'Arsa sahipleri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [projectId]),
  );

  async function handleSelect(owner: LandOwner) {
    setAssigningId(owner.id);
    try {
      await updateUnitStatusRequest(unitId, {
        status: 'given_to_land_owner',
        landOwnerId: owner.id,
      });
      // İki ekran geri: SelectLandOwner -> UnitDetail -> ProjectDetail.
      // Daire nesnesi route parametresiyle taşındığı için UnitDetail'de güncel değil;
      // ProjectDetail useFocusEffect ile listeyi yeniden çekiyor.
      navigation.pop(2);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Daire devredilemedi';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setAssigningId(null);
    }
  }

  async function handleAddOwner() {
    if (!fullName) {
      Alert.alert('Eksik bilgi', 'Ad soyad zorunlu');
      return;
    }
    const share = sharePercentage ? parseAmount(sharePercentage) : undefined;
    if (sharePercentage && (share == null || share < 0 || share > 100)) {
      Alert.alert('Geçersiz hisse', 'Hisse oranı 0 ile 100 arasında olmalı');
      return;
    }

    setIsSubmitting(true);
    try {
      await addLandOwnerRequest(projectId, {
        fullName,
        phone: phone || undefined,
        sharePercentage: share ?? undefined,
        tcOrVkn: tcOrVkn || undefined,
      });
      setFullName('');
      setPhone('');
      setSharePercentage('');
      setTcOrVkn('');
      setShowForm(false);
      await load();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Arsa sahibi eklenemedi';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalShare = owners.reduce(
    (sum, o) => sum + (o.sharePercentage ? parseFloat(o.sharePercentage) : 0),
    0,
  );

  return (
    <View style={styles.container}>
      <Text style={typeScale.label}>KAT KARŞILIĞI</Text>
      <Text style={[typeScale.display, styles.title]}>Arsa Sahibi Seç</Text>

      {isLoading && <ActivityIndicator color={colors.ink} style={{ marginTop: spacing.lg }} />}

      {!isLoading && owners.length > 0 && totalShare > 0 && (
        <Text style={[typeScale.bodyMuted, styles.shareInfo]}>
          Toplam hisse: %{totalShare.toFixed(0)}
          {totalShare !== 100 ? ' (100 değil)' : ''}
        </Text>
      )}

      <FlatList
        data={owners}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.lg }}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={typeScale.body}>Bu projede kayıtlı arsa sahibi yok.</Text>
              <Text style={typeScale.bodyMuted}>
                Aşağıdaki düğmeyle ekleyip daireyi devredebilirsiniz.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.ownerRow}
            onPress={() => handleSelect(item)}
            disabled={assigningId !== null}
          >
            <View style={styles.ownerLeft}>
              <Text style={styles.ownerName}>{item.fullName}</Text>
              <Text style={typeScale.bodyMuted}>
                {item.sharePercentage ? `%${parseFloat(item.sharePercentage)} hisse` : 'Hisse yok'}
                {item.phone ? ` · ${item.phone}` : ''}
              </Text>
            </View>
            {assigningId === item.id ? (
              <ActivityIndicator color={colors.ink} />
            ) : (
              <Text style={styles.selectText}>SEÇ</Text>
            )}
          </TouchableOpacity>
        )}
      />

      {!showForm ? (
        <Button label="+ Arsa Sahibi Ekle" variant="ghost" onPress={() => setShowForm(true)} />
      ) : (
        <View style={styles.form}>
          <Text style={[typeScale.label, { marginBottom: spacing.md }]}>YENİ ARSA SAHİBİ</Text>
          <TextField label="Ad Soyad *" value={fullName} onChangeText={setFullName} />
          <TextField
            label="Telefon"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="opsiyonel"
          />
          <TextField
            label="Hisse Oranı (%)"
            value={sharePercentage}
            onChangeText={setSharePercentage}
            keyboardType="decimal-pad"
            placeholder="örn. 50"
          />
          <TextField
            label="TC / VKN"
            value={tcOrVkn}
            onChangeText={setTcOrVkn}
            keyboardType="number-pad"
            placeholder="opsiyonel"
          />
          <Button label="Ekle" onPress={handleAddOwner} isLoading={isSubmitting} />
          <Button
            label="Vazgeç"
            variant="ghost"
            onPress={() => setShowForm(false)}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg, paddingTop: 60 },
  title: { marginBottom: spacing.md },
  shareInfo: { marginBottom: spacing.md },
  empty: { paddingVertical: spacing.lg, gap: 4 },
  ownerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    gap: spacing.md,
  },
  ownerLeft: { flex: 1, gap: 2 },
  ownerName: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.ink },
  selectText: { fontFamily: fonts.label, fontSize: 12, color: colors.accent, letterSpacing: 1 },
  form: {
    backgroundColor: colors.paperElevated,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
  },
});
