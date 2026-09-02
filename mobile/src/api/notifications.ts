import { apiClient } from './client';
import { NotificationSummary, UnreadByConversation } from '../types/notification';

export async function fetchNotificationSummary(): Promise<NotificationSummary> {
  const response = await apiClient.get<NotificationSummary>('/notifications/summary');
  return response.data;
}

export async function fetchUnreadByConversation(): Promise<UnreadByConversation> {
  const response = await apiClient.get<UnreadByConversation>(
    '/notifications/unread-by-conversation',
  );
  return response.data;
}
