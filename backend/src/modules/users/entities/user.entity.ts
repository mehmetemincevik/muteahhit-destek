import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Bu sınıf, veritabanındaki "users" tablosunun TypeScript karşılığı.
// Kolon isimleri SQL'deki ile birebir aynı olacak şekilde yazıldı (snake_case).
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

  // DİKKAT: şifre asla düz metin tutulmaz. bcrypt ile hash'lenmiş hali burada saklanır.
  // Bu alan hiçbir API cevabında dışarı çıkmamalı (bkz. auth servisindeki select hariç tutma).
  @Column({ name: 'password_hash', type: 'text' })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
