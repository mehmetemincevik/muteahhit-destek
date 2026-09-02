import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// users tablosu. Kolon adları snake_case olarak açıkça belirtilir; TypeORM'un
// otomatik adlandırmasına güvenilmez.
export enum UserRole {
  CONTRACTOR = 'contractor',
  CRAFTSMAN = 'craftsman',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  role: UserRole;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email?: string;

  // bcrypt hash'i. select: false ile varsayılan sorgulardan çıkarılır; User bir ilişki
  // olarak yüklendiğinde (örn. conversations -> craftsman -> user) yanıta sızmaması için.
  // Doğrulama sırasında açıkça seçilmesi gerekir (bkz. AuthService.login).
  @Column({ name: 'password_hash', type: 'text', select: false })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
