import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { CraftsmanServicePackage, PriceType } from './craftsman-service-package.entity';

@Entity('service_package_items')
export class ServicePackageItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'package_id', type: 'uuid' })
  packageId: string;

  @ManyToOne(() => CraftsmanServicePackage, (pkg) => pkg.items)
  @JoinColumn({ name: 'package_id' })
  package: CraftsmanServicePackage;

  @Column({ name: 'item_name', type: 'varchar', length: 150 })
  itemName: string; // "Su Tesisatı", "Doğalgaz Tesisatı" gibi

  @Column({ name: 'price_type', type: 'varchar', length: 20, nullable: true })
  priceType?: PriceType;

  @Column({ name: 'price_amount', type: 'numeric', precision: 12, scale: 2, nullable: true })
  priceAmount?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
