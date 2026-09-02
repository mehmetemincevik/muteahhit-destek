export type MessageType = 'text' | 'offer';
export type OfferSenderRole = 'contractor' | 'craftsman';
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered';

export interface Conversation {
  id: string;
  projectId: string;
  craftsmanId: string;
  contractorId: string;
  lastMessageAt?: string;
  createdAt: string;
  // Liste ucunda ilişkilerle birlikte döner
  project?: { id: string; name: string; status: string };
  craftsman?: {
    id: string;
    specialtySummary?: string;
    user?: { id: string; fullName: string };
  };
  contractor?: { id: string; fullName: string };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  messageType: MessageType;
  content?: string;
  readAt?: string;
  createdAt: string;
  // messageType 'offer' olduğunda teklif detayı; metin mesajlarında boş.
  offer?: Offer;
}

export interface Offer {
  id: string;
  messageId: string;
  conversationId: string;
  senderRole: OfferSenderRole;
  packageId?: string;
  amount: string;
  description?: string;
  status: OfferStatus;
  countersOfferId?: string;
  respondedAt?: string;
  createdAt: string;
}

// Ustalara açık proje ilanı. public_project_listings view'ından ham döner:
// alan adları snake_case, finansal alanlar dahil değil.
export interface PublicProjectListing {
  id: string;
  name: string;
  status: string;
  estimated_occupancy_date?: string;
  public_note?: string;
  province?: string;
  district?: string;
}

export interface StartConversationPayload {
  projectId: string;
  craftsmanId: string;
}

export interface SendMessagePayload {
  content: string;
}

export interface SendOfferPayload {
  packageId?: string;
  amount: number;
  description?: string;
}
