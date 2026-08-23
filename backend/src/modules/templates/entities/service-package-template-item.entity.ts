import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ServicePackageTemplate } from './service-package-template.entity';

export enum DefaultPriceType {
  PER_M2 = 'per_m2',
  FIXED = 'fixed',
  NEGOTIABLE = 'negotiable',
}

@Entity('service_package_template_items')
export class ServicePackageTemplateItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'template_id', type: 'uuid' })
  templateId: string;

  @ManyToOne(() => ServicePackageTemplate, (template) => template.items)
  @JoinColumn({ name: 'template_id' })
  template: ServicePackageTemplate;

  @Column({ name: 'item_name', type: 'varchar', length: 150 })
  itemName: string;

  @Column({ name: 'default_price_type', type: 'varchar', length: 20, nullable: true })
  defaultPriceType?: DefaultPriceType;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
