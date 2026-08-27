import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum CashflowEntryType {
  CHECK = 'check',
  RENT = 'rent',
  INSTALLMENT_PAYMENT = 'installment_payment',
  OTHER = 'other',
}

export enum CashflowDirection {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum CashflowStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

// Planlanan gelir ve gider kayıtları. Gerçekleşen hareketler ayrı tablolarda tutulur
// (payments, rental_payments, asset_transactions); dönüşüm CashflowService.markAsPaid()
// içinde yapılır.
@Entity('cashflow_calendar')
export class CashflowCalendar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contractor_id', type: 'uuid' })
  contractorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'contractor_id' })
  contractor: User;

  @Column({ name: 'entry_type', type: 'varchar', length: 30 })
  entryType: CashflowEntryType;

  @Column({ type: 'varchar', length: 10 })
  direction: CashflowDirection;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ name: 'original_amount', type: 'numeric', precision: 14, scale: 2 })
  originalAmount: number;

  @Column({ name: 'current_amount', type: 'numeric', precision: 14, scale: 2 })
  currentAmount: number;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({ type: 'varchar', length: 20, default: CashflowStatus.PENDING })
  status: CashflowStatus;

  @Column({ name: 'paid_date', type: 'date', nullable: true })
  paidDate?: Date;

  // Günlük basit faiz oranı, ondalık olarak (%0,14 -> 0.0014). Faiz her gün anapara
  // üzerinden hesaplanır, birikmiş tutar üzerinden değil.
  // null bırakılırsa kayda faiz işlemez. Veritabanı varsayılanı 0.0014'tür; faiz
  // istenmeyen kayıtlarda alan açıkça null gönderilmelidir.
  @Column({ name: 'daily_interest_rate', type: 'numeric', precision: 6, scale: 4, nullable: true })
  dailyInterestRate?: number;

  // Polimorfik referans; foreign key yoktur.
  //   installment_payment -> units
  //   rent                -> asset_rentals
  @Column({ name: 'source_table', type: 'varchar', length: 30, nullable: true })
  sourceTable?: string;

  @Column({ name: 'source_id', type: 'uuid', nullable: true })
  sourceId?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
