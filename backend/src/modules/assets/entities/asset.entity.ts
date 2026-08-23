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

export enum AssetType {
  CASH = 'cash',
  COMMODITY = 'commodity',
  REAL_ESTATE = 'real_estate',
  OTHER = 'other',
}

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contractor_id', type: 'uuid' })
  contractorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'contractor_id' })
  contractor: User;

  @Column({ name: 'asset_type', type: 'varchar', length: 20 })
  assetType: AssetType;

  @Column({ type: 'varchar', length: 200 })
  name: string; // "Kadıköy 2+1 Daire", "22 Ayar Altın", "Nakit - Vakıfbank"

  @Column({ type: 'text', nullable: true })
  description?: string;

  // CACHE ALANI: nakit/emtia için asset_transactions toplamından, mülk için en son
  // asset_value_snapshots kaydından hesaplanır (servis katmanında, her ilgili işlemden sonra).
  @Column({ name: 'current_value', type: 'numeric', precision: 14, scale: 2, default: 0 })
  currentValue: number;

  @Column({ name: 'value_updated_at', type: 'timestamptz', nullable: true })
  valueUpdatedAt?: Date;

  // Sadece real_estate tipi için anlamlı alanlar
  @Column({ type: 'varchar', length: 100, nullable: true })
  province?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  district?: string;

  @Column({ name: 'room_layout', type: 'varchar', length: 20, nullable: true })
  roomLayout?: string;

  @Column({ name: 'area_m2', type: 'numeric', precision: 8, scale: 2, nullable: true })
  areaM2?: number;

  @Column({ name: 'is_generating_rental_income', type: 'boolean', default: false })
  isGeneratingRentalIncome: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
