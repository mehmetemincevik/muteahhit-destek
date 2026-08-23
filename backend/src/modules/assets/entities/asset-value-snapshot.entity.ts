import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Asset } from './asset.entity';

@Entity('asset_value_snapshots')
export class AssetValueSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'asset_id', type: 'uuid' })
  assetId: string;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ name: 'estimated_value', type: 'numeric', precision: 14, scale: 2 })
  estimatedValue: number;

  @Column({ name: 'snapshot_date', type: 'date' })
  snapshotDate: Date;

  @Column({ type: 'varchar', length: 30, default: 'tcmb_index' })
  source: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
