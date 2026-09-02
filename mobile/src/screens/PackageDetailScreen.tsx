import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { addPackageItemRequest } from '../api/craftsmen';
import { PriceType, ServicePackage, ServicePackageItem } from '../types/craftsman';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { formatCurrency, parseAmount } from '../utils/format';

const PRICE_TYPES: { value: PriceType; label: string }[] = [
  { value: 'per_m2', label: 'm² başına' },
  { value: 'fixed', label: 'Götürü' },
  { value: 'negotiable', label: 'Pazarlığa açık' },
];

const PRICE_TYPE_SUFFIX: Record<PriceType, string> = {
  per_m2: '/m²',
  fixed: 'götürü',
  negotiable: '',
};

export default function PackageDetailScreen({ route }: any) {
  const servicePackage: ServicePackage = route.params.servicePackage;

  // Kalemler yerel state'te tutulur; yeni kalem eklendiğinde listeye eklenir.
  // Ekran açılışında paket route parametresiyle geldiği için ayrı bir istek atılmaz.
  const [items, setItems] = useState<ServicePackageItem[]>(servicePackage.items ?? []);
  const [showForm, setShowForm] = useState(false);
  const [itemName, setItemName] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('negotiable');
  const [priceAmount, setPriceAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAddItem() {
    if (!itemName) {
      Alert.alert('Eksik bilgi', 'Kalem adı zorunlu');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await addPackageItemRequest(servicePackage.id, {
        itemName,
        priceType,
        priceAmount: priceType === 'negotiable' ? undefined : (parseAmount(priceAmount) ?? undefined),
      });
      setItems((prev) => [...prev, created]);
      setItemName('');
      setPriceAmount('');
      setShowForm(false);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Kalem eklenemedi';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={typeScale.label}>HİZMET PAKETİ</Text>
      <Text style={[typeScale.display, styles.title]}>{servicePackage.name}</Text>

      {servicePackage.description && (
        <Text style={[typeScale.bodyMuted, styles.description]}>{servicePackage.description}</Text>
      )}

      {servicePackage.priceAmount && (
        <View style={styles.priceCard}>
          <Text style={styles.priceValue}>
            {formatCurrency(servicePackage.priceAmount)}
            {servicePackage.priceType ? ` ${PRICE_TYPE_SUFFIX[servicePackage.priceType]}` : ''}
          </Text>
          <Text style={typeScale.label}>PAKET FİYATI</Text>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={typeScale.label}>KALEMLER</Text>
        <View style={styles.sectionLine} />
      </View>

      {items.length === 0 ? (
        <Text style={[typeScale.bodyMuted, styles.emptyText]}>
          Bu pakette henüz kalem yok. Pakete dahil olan işleri tek tek ekleyin.
        </Text>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={typeScale.body}>{item.itemName}</Text>
            <Text style={styles.itemPrice}>
              {item.priceAmount
                ? `${formatCurrency(item.priceAmount)}${item.priceType ? ` ${PRICE_TYPE_SUFFIX[item.priceType]}` : ''}`
                : 'pazarlığa açık'}
            </Text>
          </View>
        ))
      )}

      {!showForm ? (
        <Button
          label="+ Kalem Ekle"
          variant="ghost"
          onPress={() => setShowForm(true)}
          style={{ marginTop: spacing.lg }}
        />
      ) : (
        <View style={styles.form}>
          <Text style={[typeScale.label, { marginBottom: spacing.md }]}>YENİ KALEM</Text>

          <TextField
            label="Kalem Adı *"
            value={itemName}
            onChangeText={setItemName}
            placeholder="örn. Su Tesisatı"
          />

          <Text style={[typeScale.label, { marginBottom: spacing.sm }]}>FİYATLANDIRMA</Text>
          <View style={styles.priceTypeRow}>
            {PRICE_TYPES.map((pt) => (
              <TouchableOpacity
                key={pt.value}
                style={[styles.priceChip, priceType === pt.value && styles.priceChipActive]}
                onPress={() => setPriceType(pt.value)}
              >
                <Text style={priceType === pt.value ? styles.chipTextActive : styles.chipText}>
                  {pt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {priceType !== 'negotiable' && (
            <TextField
              label={priceType === 'per_m2' ? 'Birim Fiyat (TL/m²)' : 'Bedel (TL)'}
              value={priceAmount}
              onChangeText={setPriceAmount}
              keyboardType="decimal-pad"
              placeholder="opsiyonel"
            />
          )}

          <Button label="Ekle" onPress={handleAddItem} isLoading={isSubmitting} />
          <Button
            label="Vazgeç"
            variant="ghost"
            onPress={() => setShowForm(false)}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: 60, backgroundColor: colors.paper },
  title: { marginBottom: spacing.sm },
  description: { marginBottom: spacing.md, lineHeight: 19 },
  priceCard: {
    backgroundColor: colors.paperElevated,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  priceValue: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.hairline },
  emptyText: { paddingVertical: spacing.md, lineHeight: 19 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    gap: spacing.md,
  },
  itemPrice: { ...typeScale.bodyMuted, fontSize: 13 },
  form: {
    backgroundColor: colors.paperElevated,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  priceTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  priceChip: {
    borderWidth: 1.5,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  priceChipActive: { borderColor: colors.ink, backgroundColor: colors.ink },
  chipText: { fontFamily: fonts.label, fontSize: 12, color: colors.ink, letterSpacing: 0.6 },
  chipTextActive: { fontFamily: fonts.label, fontSize: 12, color: colors.paper, letterSpacing: 0.6 },
});
