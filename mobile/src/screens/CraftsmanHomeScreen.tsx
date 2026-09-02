import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { fetchCraftsmanDetail, fetchMyAssignments, fetchMyProfile } from '../api/craftsmen';
import { CraftsmanProfile, ProjectAssignment, ServicePackage } from '../types/craftsman';
import { Button } from '../components/Button';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { Badge } from '../components/Badge';
import { fetchNotificationSummary } from '../api/notifications';
import { NotificationSummary } from '../types/notification';
import { formatCurrency } from '../utils/format';

const STATUS_LABELS: Record<string, string> = {
  active: 'Devam ediyor',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
};

const PRICE_TYPE_LABELS: Record<string, string> = {
  per_m2: '/m²',
  fixed: 'götürü',
  negotiable: 'pazarlığa açık',
};

export default function CraftsmanHomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<CraftsmanProfile | null>(null);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);

  async function load() {
    try {
      // Profil yoksa backend 404 döner; bu bir hata değil, henüz oluşturulmamış demektir.
      const [profileData, summaryData] = await Promise.all([
        fetchMyProfile().catch(() => null),
        fetchNotificationSummary().catch(() => null),
      ]);
      setProfile(profileData);
      setSummary(summaryData);

      if (profileData) {
        // Paketler yalnızca profil detayı ucunda dönüyor; kendi paketlerini görmek için
        // usta da bu ucu kullanıyor.
        const [detail, assignmentData] = await Promise.all([
          fetchCraftsmanDetail(profileData.id).catch(() => null),
          fetchMyAssignments().catch(() => []),
        ]);
        setPackages(detail?.packages ?? []);
        setAssignments(assignmentData);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const activeCount = assignments.filter((a) => a.status === 'active').length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={colors.ink} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={typeScale.label}>USTA</Text>
          <Text style={styles.name}>{user?.fullName}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickLinks}>
        <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('Conversations')}>
          <Text style={styles.quickLinkText}>MESAJLAR →</Text>
          <Badge count={(summary?.unreadMessages ?? 0) + (summary?.pendingOffers ?? 0)} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('PublicProjects')}>
          <Text style={styles.quickLinkText}>AÇIK İLANLAR →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('Portfolio')}>
          <Text style={styles.quickLinkText}>PORTFOLYO →</Text>
        </TouchableOpacity>
      </View>

      {isLoading && !profile && <ActivityIndicator color={colors.ink} style={{ marginTop: spacing.xl }} />}

      {!isLoading && !profile && (
        <View style={styles.setupCard}>
          <Text style={typeScale.h2}>Profilinizi oluşturun</Text>
          <Text style={[typeScale.bodyMuted, styles.setupText]}>
            Müteahhitlerin sizi bulabilmesi için uzmanlık alanınızı ve çalıştığınız bölgeyi
            girin. Profil oluşturulmadan hizmet paketi eklenemez.
          </Text>
          <Button label="Profil Oluştur" onPress={() => navigation.navigate('EditProfile')} />
        </View>
      )}

      {profile && (
        <>
          <View style={styles.profileCard}>
            <View style={styles.profileTop}>
              <View style={styles.profileInfo}>
                <Text style={styles.specialty}>
                  {profile.specialtySummary || 'Uzmanlık girilmemiş'}
                </Text>
                {profile.companyName && (
                  <Text style={typeScale.bodyMuted}>{profile.companyName}</Text>
                )}
                <Text style={typeScale.bodyMuted}>
                  {[profile.district, profile.province].filter(Boolean).join(', ') ||
                    'Bölge girilmemiş'}
                  {profile.yearsOfExperience ? ` · ${profile.yearsOfExperience} yıl` : ''}
                </Text>
              </View>
              <View style={styles.ratingBox}>
                <Text style={styles.ratingValue}>
                  {profile.reviewCount > 0 ? parseFloat(profile.averageRating).toFixed(1) : '—'}
                </Text>
                <Text style={styles.ratingCount}>
                  {profile.reviewCount > 0 ? `${profile.reviewCount} değerlendirme` : 'değerlendirme yok'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile', { profile })}>
              <Text style={styles.editLink}>Profili düzenle</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{activeCount}</Text>
              <Text style={typeScale.label}>AKTİF İŞ</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{packages.length}</Text>
              <Text style={typeScale.label}>HİZMET PAKETİ</Text>
            </View>
          </View>

          <SectionHeader label="HİZMET PAKETLERİM" />
          {packages.length === 0 ? (
            <Text style={[typeScale.bodyMuted, styles.emptyText]}>
              Henüz paket eklenmemiş. Verdiğiniz hizmetleri paket olarak tanımlayın.
            </Text>
          ) : (
            packages.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={styles.packageRow}
                onPress={() => navigation.navigate('PackageDetail', { servicePackage: pkg })}
              >
                <View style={styles.packageLeft}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                  <Text style={typeScale.bodyMuted}>
                    {pkg.items?.length ? `${pkg.items.length} kalem` : 'Kalem eklenmemiş'}
                  </Text>
                </View>
                {pkg.priceAmount && (
                  <Text style={styles.packagePrice}>
                    {formatCurrency(pkg.priceAmount)}
                    {pkg.priceType ? ` ${PRICE_TYPE_LABELS[pkg.priceType]}` : ''}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          )}
          <Button
            label="+ Paket Ekle"
            variant="ghost"
            onPress={() => navigation.navigate('CreatePackage')}
            style={{ marginTop: spacing.md }}
          />

          <SectionHeader label="PROJELERİM" />
          {assignments.length === 0 ? (
            <Text style={[typeScale.bodyMuted, styles.emptyText]}>
              Henüz bir projeye atanmadınız.
            </Text>
          ) : (
            assignments.map((assignment) => (
              <View key={assignment.id} style={styles.assignmentRow}>
                <View style={styles.assignmentLeft}>
                  <Text style={styles.assignmentProject}>
                    {assignment.project?.name ?? 'Proje'}
                  </Text>
                  <Text style={typeScale.bodyMuted}>
                    {STATUS_LABELS[assignment.status] ?? assignment.status}
                  </Text>
                </View>
                {assignment.agreedPrice && (
                  <Text style={styles.assignmentPrice}>
                    {formatCurrency(assignment.agreedPrice)}
                  </Text>
                )}
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={typeScale.label}>{label}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  content: { padding: spacing.lg, paddingTop: 60, paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  name: { fontFamily: fonts.display, fontSize: 24, color: colors.ink, marginTop: 4 },
  logoutText: { ...typeScale.bodyMuted, textDecorationLine: 'underline' },
  quickLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
  },
  quickLinkText: { fontFamily: fonts.label, fontSize: 12, color: colors.ink, letterSpacing: 0.8 },
  setupCard: {
    backgroundColor: colors.paperElevated,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  setupText: { lineHeight: 19, marginBottom: spacing.sm },
  profileCard: {
    backgroundColor: colors.paperElevated,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  profileTop: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  profileInfo: { flex: 1, gap: 2 },
  specialty: { fontFamily: fonts.displayMedium, fontSize: 17, color: colors.ink },
  ratingBox: { alignItems: 'flex-end' },
  ratingValue: { fontFamily: fonts.display, fontSize: 24, color: colors.accent },
  ratingCount: { ...typeScale.bodyMuted, fontSize: 11 },
  editLink: {
    ...typeScale.bodyMuted,
    fontSize: 13,
    textDecorationLine: 'underline',
    marginTop: spacing.sm,
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statBox: {
    flex: 1,
    backgroundColor: colors.paperElevated,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2,
  },
  statValue: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.hairline },
  emptyText: { paddingVertical: spacing.md, lineHeight: 19 },
  packageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    gap: spacing.md,
  },
  packageLeft: { flex: 1, gap: 2 },
  packageName: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.ink },
  packagePrice: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.ink },
  assignmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    gap: spacing.md,
  },
  assignmentLeft: { flex: 1, gap: 2 },
  assignmentProject: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.ink },
  assignmentPrice: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.ink },
});
