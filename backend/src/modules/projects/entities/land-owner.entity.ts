import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Land } from './land.entity';

@Entity('land_owners')
export class LandOwner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'land_id', type: 'uuid' })
  landId: string;

  @ManyToOne(() => Land, (land) => land.owners)
  @JoinColumn({ name: 'land_id' })
  land: Land;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'share_percentage', type: 'numeric', precision: 5, scale: 2, nullable: true })
  sharePercentage?: number;

  @Column({ name: 'tc_or_vkn', type: 'varchar', length: 20, nullable: true })
  tcOrVkn?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
