import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { LandOwner } from './land-owner.entity';

@Entity('land')
export class Land {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @OneToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ type: 'varchar', length: 100, nullable: true })
  province?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  district?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  neighborhood?: string;

  @Column({ name: 'ada_no', type: 'varchar', length: 30, nullable: true })
  adaNo?: string;

  @Column({ name: 'parsel_no', type: 'varchar', length: 30, nullable: true })
  parselNo?: string;

  @Column({ name: 'area_m2', type: 'numeric', precision: 12, scale: 2, nullable: true })
  areaM2?: number;

  @Column({ name: 'purchase_price', type: 'numeric', precision: 14, scale: 2, nullable: true })
  purchasePrice?: number;

  @Column({ name: 'purchase_date', type: 'date', nullable: true })
  purchaseDate?: Date;

  @Column({ name: 'is_kat_karsiligi', type: 'boolean', default: false })
  isKatKarsiligi: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => LandOwner, (owner) => owner.land)
  owners: LandOwner[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
