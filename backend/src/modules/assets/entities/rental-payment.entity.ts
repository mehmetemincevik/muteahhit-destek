import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { AssetRental } from './asset-rental.entity';

@Entity('rental_payments')
export class RentalPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'rental_id', type: 'uuid' })
  rentalId: string;

  @ManyToOne(() => AssetRental)
  @JoinColumn({ name: 'rental_id' })
  rental: AssetRental;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: Date;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
