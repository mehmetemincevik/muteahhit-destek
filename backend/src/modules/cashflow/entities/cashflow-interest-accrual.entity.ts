import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { CashflowCalendar } from './cashflow-calendar.entity';

// Günlük faiz tahakkukları. Kayıtlar güncellenmez veya silinmez; tutarın nasıl oluştuğu
// bu tablodan izlenir. (calendar_entry_id, accrual_date) benzersizdir ve mükerrer
// tahakkuku engeller.
@Entity('cashflow_interest_accruals')
@Unique(['calendarEntryId', 'accrualDate']) // gün başına tek tahakkuk
export class CashflowInterestAccrual {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'calendar_entry_id', type: 'uuid' })
  calendarEntryId: string;

  @ManyToOne(() => CashflowCalendar)
  @JoinColumn({ name: 'calendar_entry_id' })
  calendarEntry: CashflowCalendar;

  @Column({ name: 'accrual_date', type: 'date' })
  accrualDate: Date;

  @Column({ name: 'interest_amount', type: 'numeric', precision: 14, scale: 2 })
  interestAmount: number;

  @Column({ name: 'balance_before', type: 'numeric', precision: 14, scale: 2 })
  balanceBefore: number;

  @Column({ name: 'balance_after', type: 'numeric', precision: 14, scale: 2 })
  balanceAfter: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
