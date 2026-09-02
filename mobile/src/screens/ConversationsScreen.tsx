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
import { fetchConversations } from '../api/messaging';
import { Conversation } from '../types/messaging';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { Badge } from '../components/Badge';
import { fetchUnreadByConversation } from '../api/notifications';
import { UnreadByConversation } from '../types/notification';
import { formatDate } from '../utils/format';

export default function ConversationsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<UnreadByConversation>({});
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    try {
      const [data, unread] = await Promise.all([
        fetchConversations(),
        fetchUnreadByConversation().catch(() => ({})),
      ]);
      setConversations(data);
      setUnreadCounts(unread);
    } catch (error) {
      Alert.alert('Hata', 'Konuşmalar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  // Listede karşı tarafın adı gösterilir: müteahhit ustayı, usta müteahhidi görür.
  function counterpartName(conversation: Conversation): string {
    if (user?.role === 'contractor') {
      return (
        conversation.craftsman?.user?.fullName ||
        conversation.craftsman?.specialtySummary ||
        'Usta'
      );
    }
    return conversation.contractor?.fullName || 'Müteahhit';
  }

  return (
    <View style={styles.container}>
      <Text style={typeScale.label}>MESAJLAR</Text>
      <Text style={[typeScale.display, styles.title]}>Konuşmalar</Text>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={load} tintColor={colors.ink} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={typeScale.body}>Henüz konuşma yok.</Text>
              <Text style={typeScale.bodyMuted}>
                {user?.role === 'contractor'
                  ? 'Usta arayıp teklif sürecini başlatabilirsiniz.'
                  : 'Açık proje ilanlarından konuşma başlatabilirsiniz.'}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              navigation.navigate('ConversationDetail', {
                conversationId: item.id,
                title: counterpartName(item),
                projectName: item.project?.name,
              })
            }
          >
            <View style={styles.rowLeft}>
              <Text style={[styles.counterpart, unreadCounts[item.id] ? styles.unreadName : null]}>
                {counterpartName(item)}
              </Text>
              <Text style={typeScale.bodyMuted}>{item.project?.name ?? 'Proje'}</Text>
            </View>
            <View style={styles.rowRight}>
              {item.lastMessageAt && (
                <Text style={styles.timestamp}>{formatDate(item.lastMessageAt.slice(0, 10))}</Text>
              )}
              <Badge count={unreadCounts[item.id] ?? 0} />
            </View>
          </TouchableOpacity>
        )}
      />

      {user?.role === 'craftsman' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('PublicProjects')}
        >
          <Text style={styles.fabText}>Açık İlanlar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg, paddingTop: 60 },
  title: { marginBottom: spacing.lg },
  empty: { paddingVertical: spacing.xl, gap: 4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    gap: spacing.md,
  },
  rowLeft: { flex: 1, gap: 2 },
  counterpart: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.ink },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  timestamp: { ...typeScale.bodyMuted, fontSize: 12 },
  unreadName: { fontFamily: fonts.display },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: spacing.lg,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
  },
  fabText: { fontFamily: fonts.displayMedium, color: colors.accentInk },
});
