import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { CostItem } from './cost-item.entity';

export enum CostPaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  OTHER = 'other',
}

// payments.entity.ts (units modülü) ile BİREBİR AYNI mantık -- sadece units yerine
// cost_items'a bağlı. Bir maliyet kalemine yapılan her ödeme (avans, ara ödeme, kapanış) bir satır.
@Entity('cost_payments')
export class CostPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cost_item_id', type: 'uuid' })
  costItemId: string;

  @ManyToOne(() => CostItem)
  @JoinColumn({ name: 'cost_item_id' })
  costItem: CostItem;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount: number;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: Date;

  @Column({ name: 'payment_method', type: 'varchar', length: 30, nullable: true })
  paymentMethod?: CostPaymentMethod;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
