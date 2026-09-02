import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import {
  deletePortfolioImageRequest,
  fetchCraftsmanDetail,
  fetchMyProfile,
  uploadPortfolioImageRequest,
} from '../api/craftsmen';
import { PortfolioImage } from '../types/craftsman';
import { Button } from '../components/Button';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';

// Izgara iki sütun; kenar boşlukları ve aradaki boşluk düşülerek hücre genişliği bulunur.
const COLUMN_GAP = spacing.sm;
const CELL_SIZE = (Dimensions.get('window').width - spacing.lg * 2 - COLUMN_GAP) / 2;

export default function PortfolioScreen() {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  async function load() {
    try {
      const profile = await fetchMyProfile().catch(() => null);
      if (!profile) {
        setImages([]);
        return;
      }
      const detail = await fetchCraftsmanDetail(profile.id);
      setImages(detail.portfolioImages);
    } catch (error) {
      Alert.alert('Hata', 'Portfolyo yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  async function pickAndUpload(source: 'library' | 'camera') {
    // İzin isteği her seferinde yapılır; kullanıcı ayarlardan izni geri alabilir.
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'İzin gerekli',
        source === 'camera'
          ? 'Fotoğraf çekmek için kamera izni vermeniz gerekiyor.'
          : 'Görsel seçmek için galeri izni vermeniz gerekiyor.',
      );
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      // Sunucudaki 8 MB sınırına takılmamak için sıkıştırılır; portfolyo görselleri
      // için bu kalite yeterli.
      quality: 0.7,
      allowsEditing: false,
    };

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    setIsUploading(true);
    try {
      await uploadPortfolioImageRequest({
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });
      await load();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Görsel yüklenemedi';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setIsUploading(false);
    }
  }

  function confirmDelete(image: PortfolioImage) {
    Alert.alert('Görseli sil', 'Bu görsel portfolyodan kaldırılacak.', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePortfolioImageRequest(image.id);
            setImages((prev) => prev.filter((i) => i.id !== image.id));
          } catch (error) {
            Alert.alert('Hata', 'Görsel silinemedi');
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={typeScale.label}>USTA</Text>
      <Text style={[typeScale.display, styles.title]}>Portfolyo</Text>
      <Text style={[typeScale.bodyMuted, styles.hint]}>
        Yaptığınız işlerin fotoğrafları müteahhitlerin profilinizde görebileceği şekilde
        listelenir.
      </Text>

      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={load} tintColor={colors.ink} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={typeScale.body}>Henüz görsel eklenmemiş.</Text>
              <Text style={typeScale.bodyMuted}>
                Tamamladığınız işlerden fotoğraf ekleyerek başlayın.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cell}
            onLongPress={() => confirmDelete(item)}
            activeOpacity={0.85}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
            {item.caption ? (
              <Text style={styles.caption} numberOfLines={1}>
                {item.caption}
              </Text>
            ) : null}
          </TouchableOpacity>
        )}
      />

      {images.length > 0 && (
        <Text style={styles.deleteHint}>Silmek için görsele basılı tutun</Text>
      )}

      <View style={styles.actions}>
        {isUploading ? (
          <View style={styles.uploadingBox}>
            <ActivityIndicator color={colors.ink} />
            <Text style={typeScale.bodyMuted}>Yükleniyor…</Text>
          </View>
        ) : (
          <>
            <Button
              label="Galeriden Seç"
              onPress={() => pickAndUpload('library')}
              style={styles.actionButton}
            />
            <Button
              label="Fotoğraf Çek"
              variant="ghost"
              onPress={() => pickAndUpload('camera')}
              style={styles.actionButton}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg, paddingTop: 60 },
  title: { marginBottom: spacing.xs },
  hint: { marginBottom: spacing.lg, lineHeight: 18 },
  empty: { paddingVertical: spacing.xl, gap: 4 },
  row: { gap: COLUMN_GAP, marginBottom: COLUMN_GAP },
  cell: { width: CELL_SIZE },
  image: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: radius.md,
    backgroundColor: colors.hairline,
  },
  caption: { ...typeScale.bodyMuted, fontSize: 12, marginTop: 4 },
  deleteHint: {
    ...typeScale.bodyMuted,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  actions: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: { flex: 1 },
  uploadingBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    backgroundColor: colors.paperElevated,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
  },
});
