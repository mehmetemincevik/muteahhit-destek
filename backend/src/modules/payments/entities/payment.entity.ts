import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Unit } from '../../units/entities/unit.entity';

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  OTHER = 'other',
}

// Bir daire için gelen HER ödeme bir satır. Tek seferlik ödeme = tek satır,
// parçalı (taksitli) ödeme = birden fazla satır. Bakiye bu tablodan HESAPLANIR,
// hiçbir yerde "kalan bakiye" diye ayrı bir alan tutmuyoruz (bkz. unit_payment_summary view).
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'unit_id', type: 'uuid' })
  unitId: string;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount: number;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: Date;

  @Column({ name: 'payment_method', type: 'varchar', length: 30, nullable: true })
  paymentMethod?: PaymentMethod;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
