import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { addPackageItemRequest, createPackageRequest, fetchTemplates } from '../api/craftsmen';
import { PriceType, ServicePackageTemplate } from '../types/craftsman';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { parseAmount } from '../utils/format';

const PRICE_TYPES: { value: PriceType; label: string }[] = [
  { value: 'per_m2', label: 'm² başına' },
  { value: 'fixed', label: 'Götürü' },
  { value: 'negotiable', label: 'Pazarlığa açık' },
];

export default function CreatePackageScreen({ navigation }: any) {
  const [templates, setTemplates] = useState<ServicePackageTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ServicePackageTemplate | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('negotiable');
  const [priceAmount, setPriceAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplates()
      .then(setTemplates)
      .catch(() => Alert.alert('Uyarı', 'Hazır şablonlar yüklenemedi, paketi sıfırdan oluşturabilirsiniz'))
      .finally(() => setIsLoadingTemplates(false));
  }, []);

  // Şablon seçimi paket adını doldurur ve alt kalemleri hazırlar. Seçim geri alınabilir;
  // ad alanı serbesttir, şablondan bağımsız düzenlenebilir.
  function selectTemplate(template: ServicePackageTemplate) {
    if (selectedTemplate?.id === template.id) {
      setSelectedTemplate(null);
      return;
    }
    setSelectedTemplate(template);
    if (!name) setName(template.name);
  }

  async function handleCreate() {
    if (!name) {
      Alert.alert('Eksik bilgi', 'Paket adı zorunlu');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createPackageRequest({
        templateId: selectedTemplate?.id,
        name,
        description: description || undefined,
        priceType,
        priceAmount: priceType === 'negotiable' ? undefined : (parseAmount(priceAmount) ?? undefined),
      });

      // Şablon seçildiyse alt kalemler paket oluşturulduktan sonra tek tek eklenir;
      // backend'de toplu ekleme ucu yok. Fiyatlar boş bırakılır, usta sonradan girer.
      if (selectedTemplate) {
        for (const item of selectedTemplate.items) {
          await addPackageItemRequest(created.id, {
            itemName: item.itemName,
            priceType: item.defaultPriceType,
          });
        }
      }

      navigation.goBack();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Paket oluşturulamadı';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={typeScale.label}>YENİ KAYIT</Text>
      <Text style={[typeScale.display, styles.title]}>Hizmet Paketi</Text>

      <Text style={[typeScale.label, { marginBottom: spacing.xs }]}>HAZIR ŞABLON</Text>
      <Text style={styles.hint}>
        Şablon seçmek alt kalemleri hazır getirir. Fiyatları sonradan girersiniz.
        Şablon kullanmadan sıfırdan da oluşturabilirsiniz.
      </Text>

      {isLoadingTemplates ? (
        <ActivityIndicator color={colors.ink} style={{ marginBottom: spacing.lg }} />
      ) : (
        <View style={styles.templateWrap}>
          {templates.map((template) => {
            const isSelected = selectedTemplate?.id === template.id;
            return (
              <TouchableOpacity
                key={template.id}
                style={[styles.templateChip, isSelected && styles.templateChipActive]}
                onPress={() => selectTemplate(template)}
              >
                <Text style={isSelected ? styles.chipTextActive : styles.chipText}>
                  {template.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selectedTemplate && selectedTemplate.items.length > 0 && (
        <View style={styles.templatePreview}>
          <Text style={typeScale.label}>PAKETE EKLENECEK KALEMLER</Text>
          {selectedTemplate.items.map((item) => (
            <Text key={item.id} style={styles.previewItem}>
              · {item.itemName}
            </Text>
          ))}
        </View>
      )}

      <TextField
        label="Paket Adı *"
        value={name}
        onChangeText={setName}
        placeholder="örn. Alçı-Sıva-Astar Paketi"
      />
      <TextField
        label="Açıklama"
        value={description}
        onChangeText={setDescription}
        placeholder="opsiyonel"
        multiline
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
          label={priceType === 'per_m2' ? 'Birim Fiyat (TL/m²)' : 'Toplam Bedel (TL)'}
          value={priceAmount}
          onChangeText={setPriceAmount}
          keyboardType="decimal-pad"
          placeholder="opsiyonel"
        />
      )}

      <Button label="Kaydet" onPress={handleCreate} isLoading={isSubmitting} style={styles.submitButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: 60, backgroundColor: colors.paper },
  title: { marginBottom: spacing.lg },
  hint: { ...typeScale.bodyMuted, fontSize: 12, lineHeight: 17, marginBottom: spacing.sm },
  templateWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  templateChip: {
    borderWidth: 1.5,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  templateChipActive: { borderColor: colors.ink, backgroundColor: colors.ink },
  chipText: { fontFamily: fonts.label, fontSize: 12, color: colors.ink, letterSpacing: 0.6 },
  chipTextActive: { fontFamily: fonts.label, fontSize: 12, color: colors.paper, letterSpacing: 0.6 },
  templatePreview: {
    backgroundColor: colors.paperElevated,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: 4,
  },
  previewItem: { ...typeScale.body, fontSize: 14 },
  priceTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  priceChip: {
    borderWidth: 1.5,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  priceChipActive: { borderColor: colors.ink, backgroundColor: colors.ink },
  submitButton: { marginTop: spacing.sm },
});
