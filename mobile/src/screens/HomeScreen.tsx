import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { fetchProjects } from '../api/projects';
import { Project } from '../types/project';
import { colors, spacing, typeScale, fonts } from '../theme/tokens';
import { Badge } from '../components/Badge';
import { fetchNotificationSummary } from '../api/notifications';
import { NotificationSummary } from '../types/notification';

const STATUS_LABELS: Record<string, string> = {
  planning: 'Planlama',
  construction: 'İnşaat',
  completed: 'Tamamlandı',
  on_hold: 'Beklemede',
};

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);

  async function loadProjects() {
    try {
      // Sayaçlar ekran her odaklandığında tazelenir; ayrı bir yenileme mekanizması yok.
      const [data, summaryData] = await Promise.all([
        fetchProjects(),
        fetchNotificationSummary().catch(() => null),
      ]);
      setProjects(data);
      setSummary(summaryData);
    } catch (error: any) {
      Alert.alert('Bağlantı hatası', 'Projeler yüklenemedi. Backend çalışıyor mu?');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, []),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={typeScale.label}>{user?.role === 'contractor' ? 'MÜTEAHHİT' : 'USTA'}</Text>
          <Text style={[typeScale.display, styles.greeting]}>{user?.fullName}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      {user?.role === 'contractor' && (
        <View style={styles.quickLinks}>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('Cashflow')}>
            <Text style={styles.quickLinkText}>TAKVİM →</Text>
            <Badge count={summary?.overdueEntries ?? 0} tone="danger" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('Assets')}>
            <Text style={styles.quickLinkText}>VARLIKLAR →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('CraftsmenSearch')}>
            <Text style={styles.quickLinkText}>USTA ARA →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('Conversations')}>
            <Text style={styles.quickLinkText}>MESAJLAR →</Text>
            <Badge count={(summary?.unreadMessages ?? 0) + (summary?.pendingOffers ?? 0)} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('SelectBuyer')}>
            <Text style={styles.quickLinkText}>ALICILAR →</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.listHeader}>
        <Text style={typeScale.label}>PROJELERİM</Text>
        <View style={styles.headerLine} />
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadProjects} tintColor={colors.ink} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={typeScale.body}>Henüz proje yok.</Text>
              <Text style={typeScale.bodyMuted}>Sağ alttaki düğmeyle ilk projeni oluştur.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.projectRow}
            onPress={() =>
              navigation.navigate('ProjectDetail', {
                projectId: item.id,
                projectName: item.name,
                isPublic: item.isPublic,
              })
            }
          >
            <View style={styles.projectRowLeft}>
              <Text style={styles.projectName}>{item.name}</Text>
              <Text style={typeScale.bodyMuted}>{STATUS_LABELS[item.status] ?? item.status}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
      />

      {user?.role === 'contractor' && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateProject')}>
          <Text style={styles.fabText}>+ Yeni Proje</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  greeting: { fontSize: 24, marginTop: 4 },
  logoutText: { ...typeScale.bodyMuted, textDecorationLine: 'underline' },
  quickLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 4,
  },
  quickLinkText: { fontFamily: fonts.label, fontSize: 12, color: colors.ink, letterSpacing: 0.8 },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  headerLine: { flex: 1, height: 1, backgroundColor: colors.hairline },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  empty: { paddingVertical: spacing.xl, gap: 4 },
  projectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  projectRowLeft: { gap: 2 },
  projectName: { fontFamily: fonts.displayMedium, fontSize: 17, color: colors.ink },
  chevron: { fontSize: 22, color: colors.inkMuted },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: spacing.lg,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: 4,
  },
  fabText: { fontFamily: fonts.displayMedium, color: colors.accentInk },
});
