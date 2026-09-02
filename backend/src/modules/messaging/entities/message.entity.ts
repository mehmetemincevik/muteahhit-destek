import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '../../users/entities/user.entity';
import { Offer } from './offer.entity';

export enum MessageType {
  TEXT = 'text',
  OFFER = 'offer',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  @ManyToOne(() => Conversation)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ name: 'message_type', type: 'varchar', length: 10, default: MessageType.TEXT })
  messageType: MessageType;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt?: Date;

  // messageType 'offer' olduğunda teklif detayı buradan okunur; metin mesajlarında boştur.
  // Sohbet akışında teklif tutarı ve durumu gösterilebilsin diye ters ilişki tanımlı.
  @OneToOne(() => Offer, (offer) => offer.message)
  offer?: Offer;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
