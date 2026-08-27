import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { createCostCategoryRequest } from '../api/costs';
import { CostType } from '../types/cost';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';

// Kategoriler backend'de kullanıcıya bağlı değil (cost_categories tablosunda
// contractor_id yok); oluşturulan kayıt tüm kullanıcılara görünür. Ekranda bu
// durum kullanıcıya da bildiriliyor.
export default function CreateCostCategoryScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [costType, setCostType] = useState<CostType>('variable');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate() {
    if (!name) {
      Alert.alert('Eksik bilgi', 'Kategori adı zorunlu');
      return;
    }
    setIsSubmitting(true);
    try {
      await createCostCategoryRequest({ name, costType });
      navigation.goBack();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Kategori oluşturulamadı';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={typeScale.label}>YENİ KAYIT</Text>
      <Text style={[typeScale.display, styles.title]}>Maliyet Kategorisi</Text>

      <TextField
        label="Kategori Adı *"
        value={name}
        onChangeText={setName}
        placeholder="örn. Beton, Demir, İşçilik"
      />

      <Text style={[typeScale.label, { marginBottom: spacing.sm }]}>MALİYET TİPİ</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeOption, costType === 'fixed' && styles.typeOptionActive]}
          onPress={() => setCostType('fixed')}
        >
          <Text style={costType === 'fixed' ? styles.typeTextActive : styles.typeText}>Sabit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeOption, costType === 'variable' && styles.typeOptionActive]}
          onPress={() => setCostType('variable')}
        >
          <Text style={costType === 'variable' ? styles.typeTextActive : styles.typeText}>
            Değişken
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        {costType === 'fixed'
          ? 'Sabit: arsa bedeli, ruhsat harcı gibi önceden belli, tek seferlik kalemler.'
          : 'Değişken: beton, demir gibi piyasa fiyatına göre dalgalanan kalemler.'}
      </Text>

      <Text style={styles.warning}>
        Not: Kategoriler tüm kullanıcılar arasında paylaşılır — oluşturduğun kategori
        diğer müteahhitlere de görünür.
      </Text>

      <Button label="Kaydet" onPress={handleCreate} isLoading={isSubmitting} style={styles.submitButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: 60, backgroundColor: colors.paper },
  title: { marginBottom: spacing.xl },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  typeOption: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  typeOptionActive: { borderColor: colors.ink, backgroundColor: colors.ink },
  typeText: { fontFamily: fonts.displayMedium, color: colors.ink },
  typeTextActive: { fontFamily: fonts.displayMedium, color: colors.paper },
  hint: { ...typeScale.bodyMuted, fontSize: 13, lineHeight: 18, marginBottom: spacing.md },
  warning: {
    ...typeScale.bodyMuted,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  submitButton: { marginTop: spacing.sm },
});
