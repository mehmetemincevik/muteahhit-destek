import React, { useState } from 'react';
import { Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { createBlockRequest } from '../api/units';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { colors, spacing, typeScale } from '../theme/tokens';

export default function CreateBlockScreen({ route, navigation }: any) {
  const { projectId } = route.params;
  const [name, setName] = useState('');
  const [floorCount, setFloorCount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate() {
    if (!name) {
      Alert.alert('Eksik bilgi', 'Blok adı zorunlu');
      return;
    }
    setIsSubmitting(true);
    try {
      await createBlockRequest(projectId, {
        name,
        floorCount: floorCount ? parseInt(floorCount, 10) : undefined,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Hata', 'Blok oluşturulamadı');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={typeScale.label}>YENİ KAYIT</Text>
      <Text style={[typeScale.display, styles.title]}>Blok</Text>

      <TextField label="Blok Adı *" value={name} onChangeText={setName} placeholder="örn. A Blok" />
      <TextField
        label="Kat Sayısı"
        value={floorCount}
        onChangeText={setFloorCount}
        keyboardType="number-pad"
        placeholder="opsiyonel"
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
