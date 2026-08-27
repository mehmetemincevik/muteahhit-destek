import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { CostCategory } from './cost-category.entity';

export enum CostSource {
  MANUAL = 'manual',
  ARCHITECTURAL_PROJECT = 'architectural_project',
  STATIC_PROJECT = 'static_project',
}

@Entity('cost_items')
export class CostItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => CostCategory)
  @JoinColumn({ name: 'category_id' })
  category: CostCategory;

  @Column({ type: 'varchar', length: 200 })
  name: string; // "C25 Beton", "S420 Demir" gibi

  @Column({ type: 'numeric', precision: 14, scale: 3, nullable: true })
  quantity?: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit?: string; // "m³", "ton", "m²", "adet"

  @Column({ name: 'unit_price', type: 'numeric', precision: 14, scale: 2, nullable: true })
  unitPrice?: number;

  @Column({ name: 'total_cost', type: 'numeric', precision: 14, scale: 2 })
  totalCost: number;

  @Column({ type: 'varchar', length: 20, default: CostSource.MANUAL })
  source: CostSource;

  // Malzeme türüne göre değişen ek özellikler (örn. { malzeme_sinifi: "S420", kat: "Zemin" }).
  // Her kalem türü için ayrı kolon açmamak adına JSONB kullanılıyor.
  //
  // İçerik doğrulanmaz ve indekslenmez; bu alana göre filtreleme gerekirse GIN indeksi
  // veya ayrı kolon değerlendirilmeli.
  @Column({ name: 'extra_specs', type: 'jsonb', nullable: true })
  extraSpecs?: Record<string, any>;

  @Column({ name: 'incurred_date', type: 'date', nullable: true })
  incurredDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
