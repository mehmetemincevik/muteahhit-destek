import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { createAssetRequest } from '../api/assets';
import { AssetType } from '../types/asset';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { parseAmount } from '../utils/format';

const TYPES: { value: AssetType; label: string; hint: string }[] = [
  { value: 'cash', label: 'Nakit', hint: 'Banka hesabı veya kasa. Bakiye hareketlerden hesaplanır.' },
  { value: 'commodity', label: 'Emtia', hint: 'Altın, döviz vb. Bakiye hareketlerden hesaplanır.' },
  {
    value: 'real_estate',
    label: 'Gayrimenkul',
    hint: 'Aktif inşaat dışındaki mülkler. Değer, girilen değerleme kaydından gelir.',
  },
  { value: 'other', label: 'Diğer', hint: 'Yukarıdakilere girmeyen varlıklar.' },
];

export default function CreateAssetScreen({ navigation }: any) {
  const [assetType, setAssetType] = useState<AssetType>('cash');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [roomLayout, setRoomLayout] = useState('');
  const [areaM2, setAreaM2] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRealEstate = assetType === 'real_estate';
  const activeHint = TYPES.find((t) => t.value === assetType)?.hint;

  async function handleCreate() {
    if (!name) {
      Alert.alert('Eksik bilgi', 'Varlık adı zorunlu');
      return;
    }
    setIsSubmitting(true);
    try {
      await createAssetRequest({
        assetType,
        name,
        description: description || undefined,
        // Konum ve metraj alanları yalnızca gayrimenkulde gönderilir.
        province: isRealEstate ? province || undefined : undefined,
        district: isRealEstate ? district || undefined : undefined,
        roomLayout: isRealEstate ? roomLayout || undefined : undefined,
        areaM2: isRealEstate ? (parseAmount(areaM2) ?? undefined) : undefined,
      });
      navigation.goBack();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Varlık oluşturulamadı';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={typeScale.label}>YENİ KAYIT</Text>
      <Text style={[typeScale.display, styles.title]}>Varlık</Text>

      <Text style={[typeScale.label, { marginBottom: spacing.sm }]}>TÜR</Text>
      <View style={styles.typeWrap}>
        {TYPES.map((t) => (
          <TouchableOpacity
            key={t.value}
            style={[styles.typeChip, assetType === t.value && styles.typeChipActive]}
            onPress={() => setAssetType(t.value)}
          >
            <Text style={assetType === t.value ? styles.chipTextActive : styles.chipText}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {activeHint && <Text style={styles.hint}>{activeHint}</Text>}

      <TextField
        label="Varlık Adı *"
        value={name}
        onChangeText={setName}
        placeholder={isRealEstate ? 'örn. Kadıköy 2+1 Daire' : 'örn. Vakıfbank Hesabı'}
      />
      <TextField
        label="Açıklama"
        value={description}
        onChangeText={setDescription}
        placeholder="opsiyonel"
        multiline
      />

      {isRealEstate && (
        <>
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <TextField label="İl" value={province} onChangeText={setProvince} placeholder="İstanbul" />
            </View>
            <View style={styles.rowItem}>
              <TextField label="İlçe" value={district} onChangeText={setDistrict} placeholder="Kadıköy" />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <TextField label="Oda Tipi" value={roomLayout} onChangeText={setRoomLayout} placeholder="2+1" />
            </View>
            <View style={styles.rowItem}>
              <TextField
                label="Brüt m²"
                value={areaM2}
                onChangeText={setAreaM2}
                keyboardType="decimal-pad"
                placeholder="95"
              />
            </View>
          </View>
        </>
      )}

      <Button label="Kaydet" onPress={handleCreate} isLoading={isSubmitting} style={styles.submitButton} />

      <Text style={styles.footnote}>
        {isRealEstate
          ? 'Kayıt oluşturulduktan sonra değerleme ve kira sözleşmesi eklenebilir.'
          : 'Kayıt oluşturulduktan sonra giriş ve çıkış hareketleri eklenebilir.'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: 60, backgroundColor: colors.paper },
  title: { marginBottom: spacing.lg },
  typeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  typeChip: {
    borderWidth: 1.5,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  typeChipActive: { borderColor: colors.ink, backgroundColor: colors.ink },
  chipText: { fontFamily: fonts.label, fontSize: 12, color: colors.ink, letterSpacing: 0.6 },
  chipTextActive: { fontFamily: fonts.label, fontSize: 12, color: colors.paper, letterSpacing: 0.6 },
  hint: { ...typeScale.bodyMuted, fontSize: 12, lineHeight: 17, marginBottom: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md },
  rowItem: { flex: 1 },
  submitButton: { marginTop: spacing.sm },
  footnote: { ...typeScale.bodyMuted, fontSize: 12, marginTop: spacing.md, lineHeight: 17 },
});
