import React, { useState } from 'react';
import { Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { upsertProfileRequest } from '../api/craftsmen';
import { CraftsmanProfile } from '../types/craftsman';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { colors, spacing, typeScale } from '../theme/tokens';

// Aynı ekran hem oluşturma hem düzenleme için kullanılır; backend tarafı upsert çalışır.
// Düzenleme modunda mevcut profil route parametresiyle gelir.
export default function EditProfileScreen({ route, navigation }: any) {
  const existing: CraftsmanProfile | undefined = route.params?.profile;

  const [specialtySummary, setSpecialtySummary] = useState(existing?.specialtySummary ?? '');
  const [companyName, setCompanyName] = useState(existing?.companyName ?? '');
  const [province, setProvince] = useState(existing?.province ?? '');
  const [district, setDistrict] = useState(existing?.district ?? '');
  const [yearsOfExperience, setYearsOfExperience] = useState(
    existing?.yearsOfExperience != null ? String(existing.yearsOfExperience) : '',
  );
  const [bio, setBio] = useState(existing?.bio ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSave() {
    if (!specialtySummary) {
      Alert.alert('Eksik bilgi', 'Uzmanlık alanı zorunlu');
      return;
    }

    const years = yearsOfExperience ? parseInt(yearsOfExperience, 10) : undefined;
    if (yearsOfExperience && (Number.isNaN(years!) || years! < 0)) {
      Alert.alert('Geçersiz değer', 'Deneyim yılı geçerli bir sayı olmalı');
      return;
    }

    setIsSubmitting(true);
    try {
      await upsertProfileRequest({
        specialtySummary,
        companyName: companyName || undefined,
        province: province || undefined,
        district: district || undefined,
        yearsOfExperience: years,
        bio: bio || undefined,
      });
      navigation.goBack();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Profil kaydedilemedi';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={typeScale.label}>{existing ? 'DÜZENLE' : 'YENİ KAYIT'}</Text>
      <Text style={[typeScale.display, styles.title]}>Usta Profili</Text>

      <TextField
        label="Uzmanlık Alanı *"
        value={specialtySummary}
        onChangeText={setSpecialtySummary}
        placeholder="örn. Alçı-Sıva-Astar Ustası"
      />
      <TextField
        label="Firma Adı"
        value={companyName}
        onChangeText={setCompanyName}
        placeholder="bireysel çalışıyorsanız boş bırakın"
      />

      <TextField label="İl" value={province} onChangeText={setProvince} placeholder="örn. İstanbul" />
      <TextField label="İlçe" value={district} onChangeText={setDistrict} placeholder="örn. Kadıköy" />
      <TextField
        label="Deneyim (yıl)"
        value={yearsOfExperience}
        onChangeText={setYearsOfExperience}
        keyboardType="number-pad"
        placeholder="örn. 12"
      />
      <TextField
        label="Hakkında"
        value={bio}
        onChangeText={setBio}
        placeholder="çalışma şekliniz, referanslarınız"
        multiline
      />

      <Button label="Kaydet" onPress={handleSave} isLoading={isSubmitting} style={styles.submitButton} />

      <Text style={styles.footnote}>
        Uzmanlık alanı ve bölge, müteahhitlerin arama sonuçlarında görünür.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: 60, backgroundColor: colors.paper },
  title: { marginBottom: spacing.xl },
  submitButton: { marginTop: spacing.sm },
  footnote: { ...typeScale.bodyMuted, fontSize: 12, marginTop: spacing.md, lineHeight: 17 },
});
