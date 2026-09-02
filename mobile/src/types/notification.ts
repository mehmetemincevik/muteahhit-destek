export interface NotificationSummary {
  unreadMessages: number;
  // Müteahhit için ustadan gelen, usta için müteahhitten gelen bekleyen teklifler.
  pendingOffers: number;
  // Yalnızca müteahhit rolünde anlamlı; usta için her zaman 0.
  overdueEntries: number;
}

// Konuşma kimliği -> okunmamış mesaj sayısı
export type UnreadByConversation = Record<string, number>;
