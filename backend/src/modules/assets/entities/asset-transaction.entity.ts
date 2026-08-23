import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Asset } from './asset.entity';

export enum AssetTransactionType {
  UNIT_SALE_PAYMENT = 'unit_sale_payment',
  RENTAL_INCOME = 'rental_income',
  MANUAL_ADDITION = 'manual_addition',
  MANUAL_DEDUCTION = 'manual_deduction',
  COST_PAYMENT = 'cost_payment',
}

// Tüm varlık hareketlerinin (para girişi/çıkışı) tek merkezi log'u. PaymentsService ve
// CostsService de bu tabloya (kendi entity import'larıyla) yazıyor -- bkz. o servislerdeki
// asset_transactions ekleme adımları.
@Entity('asset_transactions')
export class AssetTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contractor_id', type: 'uuid' })
  contractorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'contractor_id' })
  contractor: User;

  // 'unit_sale_payment'/'cost_payment' için genelde NULL (belirli bir isimli varlığa değil,
  // genel deftere düşer). 'manual_addition'/'manual_deduction' için ZORUNLU.
  @Column({ name: 'asset_id', type: 'uuid', nullable: true })
  assetId?: string;

  @ManyToOne(() => Asset, { nullable: true })
  @JoinColumn({ name: 'asset_id' })
  asset?: Asset;

  @Column({ name: 'transaction_type', type: 'varchar', length: 30 })
  transactionType: AssetTransactionType;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount: number; // pozitif: giriş, negatif: çıkış

  @Column({ name: 'source_table', type: 'varchar', length: 30, nullable: true })
  sourceTable?: string;

  @Column({ name: 'source_id', type: 'uuid', nullable: true })
  sourceId?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
