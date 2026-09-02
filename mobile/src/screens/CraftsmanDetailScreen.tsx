import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchCraftsmanDetail } from '../api/craftsmen';
import { fetchProjects } from '../api/projects';
import { startConversationRequest } from '../api/messaging';
import { CraftsmanDetail } from '../types/craftsman';
import { Project } from '../types/project';
import { Button } from '../components/Button';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { formatCurrency } from '../utils/format';

const PRICE_TYPE_SUFFIX: Record<string, string> = {
  per_m2: '/m²',
  fixed: 'götürü',
  negotiable: 'pazarlığa açık',
};

export default function CraftsmanDetailScreen({ route, navigation }: any) {
  const { craftsmanId } = route.params;
  const [detail, setDetail] = useState<CraftsmanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Konuşma proje bağlamına bağlı olduğu için önce hangi proje için görüşüleceği seçilir.
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  async function load() {
    try {
      const data = await fetchCraftsmanDetail(craftsmanId);
      setDetail(data);
    } catch (error) {
      Alert.alert('Hata', 'Usta bilgileri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [craftsmanId]),
  );

  async function openProjectPicker() {
    try {
      const data = await fetchProjects();
      if (data.length === 0) {
        Alert.alert('Proje gerekli', 'Görüşme başlatmak için önce bir proje oluşturun.');
        return;
      }
      setProjects(data);
      setShowProjectPicker(true);
    } catch (error) {
      Alert.alert('Hata', 'Projeler yüklenemedi');
    }
  }

  async function startConversation(project: Project) {
    setIsStarting(true);
    try {
      const conversation = await startConversationRequest({
        projectId: project.id,
        craftsmanId,
      });
      setShowProjectPicker(false);
      navigation.navigate('ConversationDetail', {
        conversationId: conversation.id,
        title: detail?.profile.specialtySummary ?? 'Usta',
        projectName: project.name,
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Konuşma başlatılamadı';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setIsStarting(false);
    }
  }

  if (isLoading || !detail) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  const { profile, packages, portfolioImages, reviews } = detail;

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={typeScale.label}>USTA</Text>
        <Text style={[typeScale.display, styles.title]}>
          {profile.specialtySummary || 'Uzmanlık belirtilmemiş'}
        </Text>

        <View style={styles.infoCard}>
          {profile.companyName && <Text style={typeScale.body}>{profile.companyName}</Text>}
          <Text style={typeScale.bodyMuted}>
            {[profile.district, profile.province].filter(Boolean).join(', ') || 'Bölge belirtilmemiş'}
            {profile.yearsOfExperience ? ` · ${profile.yearsOfExperience} yıl deneyim` : ''}
          </Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingValue}>
              {profile.reviewCount > 0 ? parseFloat(profile.averageRating).toFixed(1) : '—'}
            </Text>
            <Text style={typeScale.bodyMuted}>
              {profile.reviewCount > 0
                ? `${profile.reviewCount} değerlendirme`
                : 'henüz değerlendirilmemiş'}
            </Text>
          </View>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        </View>

        <Button label="Teklif Görüşmesi Başlat" onPress={openProjectPicker} />

        {portfolioImages.length > 0 && (
          <>
            <SectionTitle label="YAPILAN İŞLER" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.portfolioRow}>
              {portfolioImages.map((image) => (
                <View key={image.id} style={styles.portfolioItem}>
                  <Image
                    source={{ uri: image.imageUrl }}
                    style={styles.portfolioImage}
                    resizeMode="cover"
                  />
                  {image.caption ? (
                    <Text style={styles.portfolioCaption} numberOfLines={1}>
                      {image.caption}
                    </Text>
                  ) : null}
                </View>
              ))}
            </ScrollView>
          </>
        )}

        <SectionTitle label="HİZMET PAKETLERİ" />
        {packages.length === 0 ? (
          <Text style={[typeScale.bodyMuted, styles.emptyText]}>Tanımlı paket yok.</Text>
        ) : (
          packages.map((pkg) => (
            <View key={pkg.id} style={styles.packageCard}>
              <View style={styles.packageHeader}>
                <Text style={styles.packageName}>{pkg.name}</Text>
                {pkg.priceAmount && (
                  <Text style={styles.packagePrice}>
                    {formatCurrency(pkg.priceAmount)}
                    {pkg.priceType ? ` ${PRICE_TYPE_SUFFIX[pkg.priceType]}` : ''}
                  </Text>
                )}
              </View>
              {pkg.description && <Text style={typeScale.bodyMuted}>{pkg.description}</Text>}
              {pkg.items?.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={typeScale.bodyMuted}>· {item.itemName}</Text>
                  {item.priceAmount && (
                    <Text style={typeScale.bodyMuted}>
                      {formatCurrency(item.priceAmount)}
                      {item.priceType ? PRICE_TYPE_SUFFIX[item.priceType] : ''}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))
        )}

        {reviews.length > 0 && (
          <>
            <SectionTitle label="DEĞERLENDİRMELER" />
            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewRow}>
                <Text style={styles.reviewRating}>{'★'.repeat(review.rating)}</Text>
                {review.comment && <Text style={typeScale.body}>{review.comment}</Text>}
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <Modal visible={showProjectPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={typeScale.label}>PROJE SEÇİN</Text>
            <Text style={[typeScale.bodyMuted, styles.modalHint]}>
              Görüşme bir projeye bağlı olarak yürütülür.
            </Text>

            <FlatList
              data={projects}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalRow}
                  onPress={() => startConversation(item)}
                  disabled={isStarting}
                >
                  <Text style={typeScale.body}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />

            <Button
              label="Vazgeç"
              variant="ghost"
              onPress={() => setShowProjectPicker(false)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={typeScale.label}>{label}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.paper,
  },
  container: { flexGrow: 1, backgroundColor: colors.paper, padding: spacing.lg, paddingTop: 60 },
  title: { marginBottom: spacing.md },
  infoCard: {
    backgroundColor: colors.paperElevated,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 4,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  ratingValue: { fontFamily: fonts.display, fontSize: 20, color: colors.accent },
  bio: { ...typeScale.body, fontSize: 14, lineHeight: 19, marginTop: spacing.xs },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.hairline },
  emptyText: { paddingVertical: spacing.md },
  portfolioRow: { marginBottom: spacing.sm },
  portfolioItem: { marginRight: spacing.sm, width: 140 },
  portfolioImage: {
    width: 140,
    height: 140,
    borderRadius: radius.md,
    backgroundColor: colors.hairline,
  },
  portfolioCaption: { ...typeScale.bodyMuted, fontSize: 11, marginTop: 4 },
  packageCard: {
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: 4,
  },
  packageHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  packageName: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.ink, flex: 1 },
  packagePrice: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.ink },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  reviewRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    gap: 2,
  },
  reviewRating: { color: colors.accent, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(26,35,50,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    padding: spacing.lg,
    maxHeight: '70%',
  },
  modalHint: { marginBottom: spacing.md },
  modalList: { marginBottom: spacing.md },
  modalRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
});
