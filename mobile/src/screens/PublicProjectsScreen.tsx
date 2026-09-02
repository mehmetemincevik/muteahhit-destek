import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchPublicProjects, startConversationRequest } from '../api/messaging';
import { fetchMyProfile } from '../api/craftsmen';
import { PublicProjectListing } from '../types/messaging';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { formatDate } from '../utils/format';

const STATUS_LABELS: Record<string, string> = {
  planning: 'Planlama',
  construction: 'İnşaat',
  completed: 'Tamamlandı',
  on_hold: 'Beklemede',
};

export default function PublicProjectsScreen({ navigation }: any) {
  const [projects, setProjects] = useState<PublicProjectListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);

  async function load() {
    try {
      const data = await fetchPublicProjects();
      setProjects(data);
    } catch (error) {
      Alert.alert('Hata', 'İlanlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  // Konuşma başlatmak için ustanın kendi profil kimliği gerekiyor; backend yalnızca
  // kişinin kendi profili adına konuşma açmasına izin veriyor.
  async function startConversation(project: PublicProjectListing) {
    setStartingId(project.id);
    try {
      const profile = await fetchMyProfile().catch(() => null);
      if (!profile) {
        Alert.alert(
          'Profil gerekli',
          'Konuşma başlatmadan önce usta profilinizi oluşturmanız gerekiyor.',
        );
        return;
      }

      const conversation = await startConversationRequest({
        projectId: project.id,
        craftsmanId: profile.id,
      });

      navigation.navigate('ConversationDetail', {
        conversationId: conversation.id,
        title: 'Müteahhit',
        projectName: project.name,
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Konuşma başlatılamadı';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setStartingId(null);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={typeScale.label}>İŞ FIRSATLARI</Text>
      <Text style={[typeScale.display, styles.title]}>Açık İlanlar</Text>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={load} tintColor={colors.ink} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={typeScale.body}>Şu an açık ilan yok.</Text>
              <Text style={typeScale.bodyMuted}>
                Müteahhitler projelerini ilana açtığında burada görünür.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.projectName}>{item.name}</Text>
            <Text style={typeScale.bodyMuted}>
              {[item.district, item.province].filter(Boolean).join(', ') || 'Konum belirtilmemiş'}
              {' · '}
              {STATUS_LABELS[item.status] ?? item.status}
            </Text>

            {item.public_note && <Text style={styles.note}>{item.public_note}</Text>}

            {item.estimated_occupancy_date && (
              <Text style={typeScale.bodyMuted}>
                Tahmini iskan: {formatDate(item.estimated_occupancy_date)}
              </Text>
            )}

            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => startConversation(item)}
              disabled={startingId !== null}
            >
              <Text style={styles.contactText}>
                {startingId === item.id ? 'Açılıyor…' : 'İletişime Geç'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg, paddingTop: 60 },
  title: { marginBottom: spacing.lg },
  empty: { paddingVertical: spacing.xl, gap: 4 },
  card: {
    backgroundColor: colors.paperElevated,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 4,
  },
  projectName: { fontFamily: fonts.displayMedium, fontSize: 17, color: colors.ink },
  note: { ...typeScale.body, fontSize: 14, lineHeight: 19, marginTop: spacing.xs },
  contactButton: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  contactText: { fontFamily: fonts.label, fontSize: 12, color: colors.ink, letterSpacing: 0.6 },
});
