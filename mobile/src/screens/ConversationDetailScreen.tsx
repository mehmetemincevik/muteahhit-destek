import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  acceptOfferRequest,
  counterOfferRequest,
  fetchMessages,
  rejectOfferRequest,
  sendMessageRequest,
  sendOfferRequest,
} from '../api/messaging';
import { Message, Offer } from '../types/messaging';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { formatCurrency, parseAmount } from '../utils/format';

const OFFER_STATUS_LABELS: Record<string, string> = {
  pending: 'Yanıt bekliyor',
  accepted: 'Kabul edildi',
  rejected: 'Reddedildi',
  countered: 'Karşı teklif verildi',
};

export default function ConversationDetailScreen({ route }: any) {
  const { conversationId, title, projectName } = route.params;
  const { user } = useAuth();
  const listRef = useRef<FlatList<Message>>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Teklif formu. counterTargetId doluysa gönderilen teklif karşı teklif olarak kaydedilir.
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [counterTargetId, setCounterTargetId] = useState<string | null>(null);
  const [respondingOfferId, setRespondingOfferId] = useState<string | null>(null);

  async function load() {
    try {
      const data = await fetchMessages(conversationId);
      setMessages(data);
    } catch (error) {
      Alert.alert('Hata', 'Mesajlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [conversationId]),
  );

  async function handleSendMessage() {
    if (!draft.trim()) return;
    setIsSending(true);
    try {
      await sendMessageRequest(conversationId, { content: draft.trim() });
      setDraft('');
      await load();
      listRef.current?.scrollToEnd({ animated: true });
    } catch (error: any) {
      Alert.alert('Hata', error?.response?.data?.message || 'Mesaj gönderilemedi');
    } finally {
      setIsSending(false);
    }
  }

  async function handleSendOffer() {
    const parsed = parseAmount(offerAmount);
    if (parsed == null || parsed <= 0) {
      Alert.alert('Geçersiz tutar', 'Sıfırdan büyük bir tutar girin');
      return;
    }

    setIsSending(true);
    try {
      const payload = { amount: parsed, description: offerDescription || undefined };
      if (counterTargetId) {
        await counterOfferRequest(counterTargetId, payload);
      } else {
        await sendOfferRequest(conversationId, payload);
      }
      setOfferAmount('');
      setOfferDescription('');
      setCounterTargetId(null);
      setShowOfferForm(false);
      await load();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Teklif gönderilemedi';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setIsSending(false);
    }
  }

  function confirmAccept(offer: Offer) {
    Alert.alert(
      'Teklifi kabul et',
      `${formatCurrency(offer.amount)} tutarındaki teklif kabul edilecek ve usta projeye atanacak. Onaylıyor musunuz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Kabul Et', onPress: () => respondToOffer(offer.id, 'accept') },
      ],
    );
  }

  async function respondToOffer(offerId: string, action: 'accept' | 'reject') {
    setRespondingOfferId(offerId);
    try {
      if (action === 'accept') {
        await acceptOfferRequest(offerId);
      } else {
        await rejectOfferRequest(offerId);
      }
      await load();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'İşlem başarısız';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setRespondingOfferId(null);
    }
  }

  function renderMessage(message: Message) {
    const isOwn = message.senderId === user?.id;

    if (message.messageType === 'offer' && message.offer) {
      const offer = message.offer;
      // Teklifi gönderen taraf kendi teklifini yanıtlayamaz; yalnızca karşı taraf
      // kabul, red veya karşı teklif verebilir.
      const canRespond = !isOwn && offer.status === 'pending';

      return (
        <View style={[styles.offerCard, isOwn ? styles.own : styles.other]}>
          <Text style={typeScale.label}>{isOwn ? 'GÖNDERDİĞİNİZ TEKLİF' : 'GELEN TEKLİF'}</Text>
          <Text style={styles.offerAmount}>{formatCurrency(offer.amount)}</Text>
          {offer.description && (
            <Text style={[typeScale.bodyMuted, styles.offerDescription]}>{offer.description}</Text>
          )}

          <View style={styles.offerStatusRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    offer.status === 'accepted'
                      ? colors.statusAvailable
                      : offer.status === 'rejected'
                        ? colors.danger
                        : colors.inkMuted,
                },
              ]}
            />
            <Text style={typeScale.bodyMuted}>{OFFER_STATUS_LABELS[offer.status]}</Text>
          </View>

          {canRespond && (
            <View style={styles.offerActions}>
              {respondingOfferId === offer.id ? (
                <ActivityIndicator color={colors.ink} />
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.offerButton, styles.acceptButton]}
                    onPress={() => confirmAccept(offer)}
                  >
                    <Text style={styles.acceptText}>Kabul Et</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.offerButton}
                    onPress={() => respondToOffer(offer.id, 'reject')}
                  >
                    <Text style={styles.offerButtonText}>Reddet</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.offerButton}
                    onPress={() => {
                      setCounterTargetId(offer.id);
                      setOfferAmount('');
                      setShowOfferForm(true);
                    }}
                  >
                    <Text style={styles.offerButtonText}>Karşı Teklif</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={isOwn ? styles.ownText : styles.otherText}>{message.content}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <Text style={typeScale.label}>{projectName ?? 'PROJE'}</Text>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.ink} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => renderMessage(item)}
          ListEmptyComponent={
            <Text style={[typeScale.bodyMuted, styles.emptyText]}>
              Henüz mesaj yok. Bir mesaj yazın veya teklif gönderin.
            </Text>
          }
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      {showOfferForm ? (
        <View style={styles.offerForm}>
          <Text style={[typeScale.label, { marginBottom: spacing.sm }]}>
            {counterTargetId ? 'KARŞI TEKLİF' : 'YENİ TEKLİF'}
          </Text>
          <TextInput
            style={styles.formInput}
            value={offerAmount}
            onChangeText={setOfferAmount}
            keyboardType="decimal-pad"
            placeholder="Tutar (TL)"
            placeholderTextColor={colors.inkMuted}
          />
          <TextInput
            style={styles.formInput}
            value={offerDescription}
            onChangeText={setOfferDescription}
            placeholder="Açıklama (opsiyonel)"
            placeholderTextColor={colors.inkMuted}
          />
          <Button label="Gönder" onPress={handleSendOffer} isLoading={isSending} />
          <Button
            label="Vazgeç"
            variant="ghost"
            onPress={() => {
              setShowOfferForm(false);
              setCounterTargetId(null);
            }}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      ) : (
        <View style={styles.composer}>
          <TouchableOpacity
            style={styles.offerTrigger}
            onPress={() => {
              setCounterTargetId(null);
              setShowOfferForm(true);
            }}
          >
            <Text style={styles.offerTriggerText}>₺</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Mesaj yazın"
            placeholderTextColor={colors.inkMuted}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!draft.trim() || isSending}
          >
            <Text style={styles.sendText}>Gönder</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  headerTitle: { fontFamily: fonts.displayMedium, fontSize: 20, color: colors.ink, marginTop: 2 },
  messageList: { padding: spacing.lg, gap: spacing.sm },
  emptyText: { textAlign: 'center', paddingVertical: spacing.xl },
  bubble: {
    maxWidth: '80%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  ownBubble: { alignSelf: 'flex-end', backgroundColor: colors.ink },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.paperElevated,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  ownText: { color: colors.paper, fontSize: 15 },
  otherText: { color: colors.ink, fontSize: 15 },
  offerCard: {
    maxWidth: '85%',
    backgroundColor: colors.paperElevated,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  own: { alignSelf: 'flex-end' },
  other: { alignSelf: 'flex-start' },
  offerAmount: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  offerDescription: { fontSize: 13, lineHeight: 18 },
  offerStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  offerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  offerButton: {
    borderWidth: 1.5,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  acceptButton: { borderColor: colors.statusAvailable, backgroundColor: colors.statusAvailable },
  acceptText: { fontFamily: fonts.label, fontSize: 11, color: colors.paper, letterSpacing: 0.6 },
  offerButtonText: { fontFamily: fonts.label, fontSize: 11, color: colors.ink, letterSpacing: 0.6 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.paperElevated,
  },
  offerTrigger: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerTriggerText: { fontFamily: fonts.display, fontSize: 18, color: colors.accent },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: colors.ink,
  },
  sendButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 11,
    paddingHorizontal: spacing.md,
  },
  sendButtonDisabled: { opacity: 0.4 },
  sendText: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.accentInk },
  offerForm: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.paperElevated,
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: 15,
    color: colors.ink,
  },
});
