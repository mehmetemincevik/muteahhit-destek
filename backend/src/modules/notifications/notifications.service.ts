import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

type AuthUser = { userId: string; role: string };

// Ana ekranda gösterilen sayaçlar. Her ekranın ayrı sorgu atması yerine tek uçta
// toplanır; sayılar rol bazında farklı anlam taşır.
export interface NotificationSummary {
  unreadMessages: number;
  pendingOffers: number;
  // Yalnızca müteahhit için anlamlı; usta rolünde her zaman 0 döner.
  overdueEntries: number;
}

@Injectable()
export class NotificationsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getSummary(user: AuthUser): Promise<NotificationSummary> {
    return user.role === 'contractor'
      ? this.contractorSummary(user.userId)
      : this.craftsmanSummary(user.userId);
  }

  private async contractorSummary(userId: string): Promise<NotificationSummary> {
    // Üç sayaç tek sorguda toplanır; ayrı ayrı çağrı yapmak gidiş-dönüş maliyetini artırır.
    const rows = await this.dataSource.query(
      `SELECT
         (SELECT count(*) FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
          WHERE c.contractor_id = $1
            AND m.sender_id <> $1
            AND m.read_at IS NULL) AS unread_messages,
         (SELECT count(*) FROM offers o
            JOIN conversations c ON c.id = o.conversation_id
          WHERE c.contractor_id = $1
            AND o.status = 'pending'
            AND o.sender_role = 'craftsman') AS pending_offers,
         (SELECT count(*) FROM cashflow_calendar
          WHERE contractor_id = $1
            AND status = 'overdue') AS overdue_entries`,
      [userId],
    );

    const row = rows[0];
    return {
      unreadMessages: Number(row.unread_messages),
      pendingOffers: Number(row.pending_offers),
      overdueEntries: Number(row.overdue_entries),
    };
  }

  private async craftsmanSummary(userId: string): Promise<NotificationSummary> {
    // Usta kayıtları craftsman_profiles üzerinden bağlanır; profil oluşturulmamışsa
    // konuşma da olamayacağı için sayaçlar sıfır döner.
    const rows = await this.dataSource.query(
      `SELECT
         (SELECT count(*) FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            JOIN craftsman_profiles p ON p.id = c.craftsman_id
          WHERE p.user_id = $1
            AND m.sender_id <> $1
            AND m.read_at IS NULL) AS unread_messages,
         (SELECT count(*) FROM offers o
            JOIN conversations c ON c.id = o.conversation_id
            JOIN craftsman_profiles p ON p.id = c.craftsman_id
          WHERE p.user_id = $1
            AND o.status = 'pending'
            AND o.sender_role = 'contractor') AS pending_offers`,
      [userId],
    );

    const row = rows[0];
    return {
      unreadMessages: Number(row.unread_messages),
      pendingOffers: Number(row.pending_offers),
      overdueEntries: 0,
    };
  }

  // Konuşma listesinde hangi hattın okunmamış mesajı olduğunu göstermek için.
  async getUnreadCountsByConversation(user: AuthUser): Promise<Record<string, number>> {
    const rows = await this.dataSource.query(
      `SELECT m.conversation_id, count(*)::int AS unread
         FROM messages m
         JOIN conversations c ON c.id = m.conversation_id
         LEFT JOIN craftsman_profiles p ON p.id = c.craftsman_id
        WHERE (c.contractor_id = $1 OR p.user_id = $1)
          AND m.sender_id <> $1
          AND m.read_at IS NULL
        GROUP BY m.conversation_id`,
      [user.userId],
    );

    return Object.fromEntries(rows.map((r: any) => [r.conversation_id, Number(r.unread)]));
  }
}
