import React, { useState } from 'react';
import { Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { createUnitRequest } from '../api/units';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { colors, spacing, typeScale } from '../theme/tokens';

export default function CreateUnitScreen({ route, navigation }: any) {
  const { blockId, blockName } = route.params;
  const [floorNo, setFloorNo] = useState('');
  const [unitNo, setUnitNo] = useState('');
  const [roomLayout, setRoomLayout] = useState('');
  const [grossM2, setGrossM2] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate() {
    if (!floorNo || !unitNo) {
      Alert.alert('Eksik bilgi', 'Kat no ve daire no zorunlu');
      return;
    }
    setIsSubmitting(true);
    try {
      await createUnitRequest(blockId, {
        floorNo: parseInt(floorNo, 10),
        unitNo,
        roomLayout: roomLayout || undefined,
        grossM2: grossM2 ? parseFloat(grossM2) : undefined,
        salePrice: salePrice ? parseFloat(salePrice) : undefined,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Hata', 'Daire oluşturulamadı');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={typeScale.label}>{blockName}</Text>
      <Text style={[typeScale.display, styles.title]}>Yeni Daire</Text>

      <TextField label="Kat No *" value={floorNo} onChangeText={setFloorNo} keyboardType="number-pad" placeholder="örn. 3" />
      <TextField label="Daire No *" value={unitNo} onChangeText={setUnitNo} placeholder="örn. 12" />
      <TextField label="Oda Tipi" value={roomLayout} onChangeText={setRoomLayout} placeholder="örn. 3+1" />
      <TextField label="Brüt m²" value={grossM2} onChangeText={setGrossM2} keyboardType="decimal-pad" placeholder="opsiyonel" />
      <TextField
        label="Satış Fiyatı (TL)"
        value={salePrice}
        onChangeText={setSalePrice}
        keyboardType="decimal-pad"
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
