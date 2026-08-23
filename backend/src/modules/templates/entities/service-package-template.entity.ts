import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { ServicePackageTemplateItem } from './service-package-template-item.entity';

@Entity('service_package_templates')
export class ServicePackageTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category?: string; // "Kaba İnşaat", "İnce İşler", "Tesisat" gibi

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => ServicePackageTemplateItem, (item) => item.template)
  items: ServicePackageTemplateItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
