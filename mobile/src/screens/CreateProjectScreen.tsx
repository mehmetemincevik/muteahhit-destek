import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { createProjectRequest } from '../api/projects';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { DateField } from '../components/DateField';
import { colors, spacing, typeScale } from '../theme/tokens';

export default function CreateProjectScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [estimatedOccupancyDate, setEstimatedOccupancyDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate() {
    if (!name) {
      Alert.alert('Eksik bilgi', 'Proje adı zorunlu');
      return;
    }
    setIsSubmitting(true);
    try {
      await createProjectRequest({
        name,
        province: province || undefined,
        district: district || undefined,
        estimatedOccupancyDate: estimatedOccupancyDate || undefined,
      });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Hata', 'Proje oluşturulamadı');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={typeScale.label}>YENİ KAYIT</Text>
      <Text style={[typeScale.display, styles.title]}>Proje</Text>

      <TextField label="Proje Adı *" value={name} onChangeText={setName} placeholder="örn. Yeşiltepe Sitesi" />
      <TextField label="İl" value={province} onChangeText={setProvince} placeholder="opsiyonel" />
      <TextField label="İlçe" value={district} onChangeText={setDistrict} placeholder="opsiyonel" />
      <DateField
        label="Tahmini İskan Tarihi"
        value={estimatedOccupancyDate}
        onChange={setEstimatedOccupancyDate}
        placeholder="Opsiyonel"
        clearable
        minimumDate={new Date()}
      />

      <Button label="Oluştur" onPress={handleCreate} isLoading={isSubmitting} style={styles.submitButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: 60, backgroundColor: colors.paper },
  title: { marginBottom: spacing.xl },
  submitButton: { marginTop: spacing.sm },
});
