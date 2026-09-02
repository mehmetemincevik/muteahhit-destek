import { apiClient } from './client';
import {
  Conversation,
  Message,
  Offer,
  PublicProjectListing,
  SendMessagePayload,
  SendOfferPayload,
  StartConversationPayload,
} from '../types/messaging';

export async function fetchConversations(): Promise<Conversation[]> {
  const response = await apiClient.get<Conversation[]>('/conversations');
  return response.data;
}

// Mevcut konuşma varsa onu döner, yoksa oluşturur.
export async function startConversationRequest(
  payload: StartConversationPayload,
): Promise<Conversation> {
  const response = await apiClient.post<Conversation>('/conversations', payload);
  return response.data;
}

// Bu çağrı aynı zamanda karşı tarafın okunmamış mesajlarını okundu işaretler.
export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const response = await apiClient.get<Message[]>(`/conversations/${conversationId}/messages`);
  return response.data;
}

export async function sendMessageRequest(
  conversationId: string,
  payload: SendMessagePayload,
): Promise<Message> {
  const response = await apiClient.post<Message>(
    `/conversations/${conversationId}/messages`,
    payload,
  );
  return response.data;
}

export async function sendOfferRequest(
  conversationId: string,
  payload: SendOfferPayload,
): Promise<Offer> {
  const response = await apiClient.post<Offer>(`/conversations/${conversationId}/offers`, payload);
  return response.data;
}

export async function acceptOfferRequest(offerId: string): Promise<Offer> {
  const response = await apiClient.patch<Offer>(`/offers/${offerId}/accept`);
  return response.data;
}

export async function rejectOfferRequest(offerId: string): Promise<Offer> {
  const response = await apiClient.patch<Offer>(`/offers/${offerId}/reject`);
  return response.data;
}

export async function counterOfferRequest(
  offerId: string,
  payload: SendOfferPayload,
): Promise<Offer> {
  const response = await apiClient.post<Offer>(`/offers/${offerId}/counter`, payload);
  return response.data;
}

export async function fetchPublicProjects(): Promise<PublicProjectListing[]> {
  const response = await apiClient.get<PublicProjectListing[]>('/projects/public');
  return response.data;
}
