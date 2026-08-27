import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CraftsmanProfile } from './craftsman-profile.entity';
import { ServicePackageItem } from './service-package-item.entity';

export enum PriceType {
  PER_M2 = 'per_m2',
  FIXED = 'fixed',
  NEGOTIABLE = 'negotiable',
}

// Usta hizmet paketleri. Hazır şablondan türetilebilir veya sıfırdan oluşturulabilir.
//
// templateId, service_package_templates kaydına işaret eder. İlişki entity tarafında
// tanımlı değil; foreign key yalnızca veritabanı seviyesinde mevcut.
@Entity('craftsman_service_packages')
export class CraftsmanServicePackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'craftsman_id', type: 'uuid' })
  craftsmanId: string;

  @ManyToOne(() => CraftsmanProfile)
  @JoinColumn({ name: 'craftsman_id' })
  craftsman: CraftsmanProfile;

  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId?: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'price_type', type: 'varchar', length: 20, nullable: true })
  priceType?: PriceType;

  @Column({ name: 'price_amount', type: 'numeric', precision: 12, scale: 2, nullable: true })
  priceAmount?: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => ServicePackageItem, (item) => item.package)
  items: ServicePackageItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
