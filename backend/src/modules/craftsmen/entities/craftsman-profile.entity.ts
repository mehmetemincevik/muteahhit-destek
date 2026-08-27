import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

// craftsman rolündeki kullanıcının profil bilgileri (users ile bire bir).
// Profil kayıt anında oluşmaz; usta ilk kez kaydettiğinde açılır.
@Entity('craftsman_profiles')
export class CraftsmanProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'company_name', type: 'varchar', length: 200, nullable: true })
  companyName?: string;

  @Column({ name: 'specialty_summary', type: 'varchar', length: 300, nullable: true })
  specialtySummary?: string; // "Alçı-Sıva-Astar Ustası" gibi

  @Column({ type: 'varchar', length: 100, nullable: true })
  province?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  district?: string;

  @Column({ name: 'years_of_experience', type: 'int', nullable: true })
  yearsOfExperience?: number;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  // Türetilmiş alanlar; doğrudan yazılmaz. Her yeni değerlendirmede
  // CraftsmenService.recomputeRating ile yeniden hesaplanır.
  @Column({ name: 'average_rating', type: 'numeric', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ name: 'review_count', type: 'int', default: 0 })
  reviewCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
