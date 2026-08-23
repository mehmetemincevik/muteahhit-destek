import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { CraftsmanProfile } from './craftsman-profile.entity';
import { CraftsmanServicePackage } from './craftsman-service-package.entity';

@Entity('craftsman_portfolio_images')
export class CraftsmanPortfolioImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'craftsman_id', type: 'uuid' })
  craftsmanId: string;

  @ManyToOne(() => CraftsmanProfile)
  @JoinColumn({ name: 'craftsman_id' })
  craftsman: CraftsmanProfile;

  @Column({ name: 'package_id', type: 'uuid', nullable: true })
  packageId?: string;

  @ManyToOne(() => CraftsmanServicePackage, { nullable: true })
  @JoinColumn({ name: 'package_id' })
  package?: CraftsmanServicePackage;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl: string; // obje depolama (S3/R2/MinIO) linki -- MVP'de dışarıdan bir URL olarak girilir

  @Column({ type: 'varchar', length: 300, nullable: true })
  caption?: string;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;
}
