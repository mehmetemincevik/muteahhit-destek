import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { Conversation } from './conversation.entity';
import { CraftsmanServicePackage } from '../../craftsmen/entities/craftsman-service-package.entity';

export enum OfferSenderRole {
  CONTRACTOR = 'contractor',
  CRAFTSMAN = 'craftsman',
}

export enum OfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COUNTERED = 'countered',
}

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'message_id', type: 'uuid', unique: true })
  messageId: string;

  @OneToOne(() => Message, (message) => message.offer)
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  @ManyToOne(() => Conversation)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({ name: 'sender_role', type: 'varchar', length: 15 })
  senderRole: OfferSenderRole;

  @Column({ name: 'package_id', type: 'uuid', nullable: true })
  packageId?: string;

  @ManyToOne(() => CraftsmanServicePackage, { nullable: true })
  @JoinColumn({ name: 'package_id' })
  package?: CraftsmanServicePackage;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 20, default: OfferStatus.PENDING })
  status: OfferStatus;

  @Column({ name: 'counters_offer_id', type: 'uuid', nullable: true })
  countersOfferId?: string;

  @ManyToOne(() => Offer, { nullable: true })
  @JoinColumn({ name: 'counters_offer_id' })
  countersOffer?: Offer;

  @Column({ name: 'responded_at', type: 'timestamptz', nullable: true })
  respondedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
