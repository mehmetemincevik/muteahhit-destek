import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Asset } from './asset.entity';

@Entity('asset_rentals')
export class AssetRental {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'asset_id', type: 'uuid' })
  assetId: string;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ name: 'tenant_name', type: 'varchar', length: 150, nullable: true })
  tenantName?: string;

  @Column({ name: 'tenant_phone', type: 'varchar', length: 20, nullable: true })
  tenantPhone?: string;

  @Column({ name: 'monthly_rent', type: 'numeric', precision: 12, scale: 2 })
  monthlyRent: number;

  @Column({ name: 'contract_start_date', type: 'date', nullable: true })
  contractStartDate?: Date;

  @Column({ name: 'contract_end_date', type: 'date', nullable: true })
  contractEndDate?: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
