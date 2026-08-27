import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { createCostItemRequest, fetchCostCategories } from '../api/costs';
import { CostCategory } from '../types/cost';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { formatCurrency, parseAmount } from '../utils/format';

export default function CreateCostItemScreen({ route, navigation }: any) {
  const { projectId, projectName } = route.params;
  const [categories, setCategories] = useState<CostCategory[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCostCategories();
        setCategories(data);
      } catch (error) {
        Alert.alert('Hata', 'Kategoriler yüklenemedi');
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  // Miktar ve birim fiyat girildiğinde toplamı OTOMATİK hesaplıyoruz -- kullanıcı
  // isterse üzerine yazıp elle de değiştirebilir (örn. indirim/pazarlık durumunda).
  useEffect(() => {
    const q = parseAmount(quantity);
    const p = parseAmount(unitPrice);
    if (q != null && p != null && q > 0 && p > 0) {
      setTotalCost(String(q * p));
    }
  }, [quantity, unitPrice]);

  async function handleCreate() {
    if (!categoryId) {
      Alert.alert('Eksik bilgi', 'Bir kategori seç');
      return;
    }
    if (!name) {
      Alert.alert('Eksik bilgi', 'Kalem adı zorunlu');
      return;
    }
    const parsedTotal = parseAmount(totalCost);
    if (parsedTotal == null || parsedTotal <= 0) {
      Alert.alert('Geçersiz tutar', 'Toplam maliyet sıfırdan büyük olmalı');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCostItemRequest(projectId, {
        categoryId,
        name,
        quantity: parseAmount(quantity) ?? undefined,
        unit: unit || undefined,
        unitPrice: parseAmount(unitPrice) ?? undefined,
        totalCost: parsedTotal,
      });
      navigation.goBack();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Kalem oluşturulamadı';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={typeScale.label}>{projectName}</Text>
      <Text style={[typeScale.display, styles.title]}>Maliyet Kalemi</Text>

      <Text style={[typeScale.label, { marginBottom: spacing.sm }]}>KATEGORİ *</Text>
      {isLoadingCategories ? (
        <ActivityIndicator color={colors.ink} style={{ marginBottom: spacing.lg }} />
      ) : categories.length === 0 ? (
        <View style={styles.noCategoryBox}>
          <Text style={typeScale.bodyMuted}>
            Henüz kategori yok. Aşağıdaki düğmeyle bir tane oluştur.
          </Text>
        </View>
      ) : (
        <View style={styles.categoryWrap}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, categoryId === cat.id && styles.categoryChipActive]}
              onPress={() => setCategoryId(cat.id)}
            >
              <View
                style={[
                  styles.typeDot,
                  { backgroundColor: cat.costType === 'fixed' ? colors.ink : colors.accent },
                  categoryId === cat.id && { backgroundColor: colors.paper },
                ]}
              />
              <Text style={categoryId === cat.id ? styles.chipTextActive : styles.chipText}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.newCategoryButton}
        onPress={() => navigation.navigate('CreateCostCategory')}
      >
        <Text style={styles.newCategoryText}>+ Yeni Kategori</Text>
      </TouchableOpacity>

      <TextField label="Kalem Adı *" value={name} onChangeText={setName} placeholder="örn. C25 Beton" />

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <TextField
            label="Miktar"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
            placeholder="100"
          />
        </View>
        <View style={styles.rowItem}>
          <TextField label="Birim" value={unit} onChangeText={setUnit} placeholder="m³, ton, adet" />
        </View>
      </View>

      <TextField
        label="Birim Fiyat (TL)"
        value={unitPrice}
        onChangeText={setUnitPrice}
        keyboardType="decimal-pad"
        placeholder="opsiyonel"
      />

      <TextField
        label="Toplam Maliyet (TL) *"
        value={totalCost}
        onChangeText={setTotalCost}
        keyboardType="decimal-pad"
        placeholder="miktar x birim fiyat otomatik hesaplanır"
      />
      {parseAmount(totalCost) != null && parseAmount(totalCost)! > 0 && (
        <Text style={styles.totalPreview}>{formatCurrency(parseAmount(totalCost))}</Text>
      )}

      <Button label="Kaydet" onPress={handleCreate} isLoading={isSubmitting} style={styles.submitButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: 60, backgroundColor: colors.paper },
  title: { marginBottom: spacing.lg },
  categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  categoryChipActive: { borderColor: colors.ink, backgroundColor: colors.ink },
  typeDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontFamily: fonts.label, fontSize: 12, color: colors.ink, letterSpacing: 0.6 },
  chipTextActive: { fontFamily: fonts.label, fontSize: 12, color: colors.paper, letterSpacing: 0.6 },
  noCategoryBox: { paddingVertical: spacing.md },
  newCategoryButton: { alignSelf: 'flex-start', marginBottom: spacing.lg },
  newCategoryText: { fontFamily: fonts.label, fontSize: 12, color: colors.accent, letterSpacing: 0.8 },
  row: { flexDirection: 'row', gap: spacing.md },
  rowItem: { flex: 1 },
  totalPreview: {
    fontFamily: fonts.displayMedium,
    fontSize: 18,
    color: colors.ink,
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
  },
  submitButton: { marginTop: spacing.sm },
});
