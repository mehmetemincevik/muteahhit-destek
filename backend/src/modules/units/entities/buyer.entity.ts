import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

// Daire alıcıları (uygulama içi kullanıcı değil, sadece müteahhidin tuttuğu bilgi kaydı).
// Her alıcı BİR müteahhide aittir -- başka müteahhitler bu kaydı göremez (kişisel veri).
@Entity('buyers')
export class Buyer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contractor_id', type: 'uuid' })
  contractorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'contractor_id' })
  contractor: User;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email?: string;

  @Column({ name: 'tc_or_vkn', type: 'varchar', length: 20, nullable: true })
  tcOrVkn?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
