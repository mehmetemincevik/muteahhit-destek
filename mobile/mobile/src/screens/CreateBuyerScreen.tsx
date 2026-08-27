import React, { useState } from 'react';
import { Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { createBuyerRequest } from '../api/units';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { colors, spacing, typeScale } from '../theme/tokens';

export default function CreateBuyerScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [tcOrVkn, setTcOrVkn] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate() {
    if (!fullName) {
      Alert.alert('Eksik bilgi', 'Ad soyad zorunlu');
      return;
    }
    setIsSubmitting(true);
    try {
      await createBuyerRequest({
        fullName,
        phone: phone || undefined,
        tcOrVkn: tcOrVkn || undefined,
        email: email || undefined,
        address: address || undefined,
      });
      // Listeye dönülür; useFocusEffect yeni kaydı çeker. Satış akışından gelindiyse
      // seçim modu korunduğu için kayıt hemen seçilebilir durumda olur.
      navigation.goBack();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Alıcı oluşturulamadı';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={typeScale.label}>YENİ KAYIT</Text>
      <Text style={[typeScale.display, styles.title]}>Alıcı</Text>

      <TextField label="Ad Soyad *" value={fullName} onChangeText={setFullName} />
      <TextField label="Telefon" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="opsiyonel" />
      <TextField label="TC / VKN" value={tcOrVkn} onChangeText={setTcOrVkn} keyboardType="number-pad" placeholder="opsiyonel" />
      <TextField
        label="E-posta"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="opsiyonel"
      />
      <TextField label="Adres" value={address} onChangeText={setAddress} placeholder="opsiyonel" multiline />

      <Button label="Kaydet" onPress={handleCreate} isLoading={isSubmitting} style={styles.submitButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: 60, backgroundColor: colors.paper },
  title: { marginBottom: spacing.xl },
  submitButton: { marginTop: spacing.sm },
});
