import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { CraftsmanProfile } from '../../craftsmen/entities/craftsman-profile.entity';
import { User } from '../../users/entities/user.entity';

// Bir konuşma HER ZAMAN bir proje + bir usta + o projenin müteahhidi üçlüsüne bağlı.
// Proje bağlamı olmadan serbest mesajlaşma YOK.
@Entity('conversations')
@Unique(['projectId', 'craftsmanId']) // bu proje-usta ikilisi için tek bir konuşma hattı
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'craftsman_id', type: 'uuid' })
  craftsmanId: string;

  @ManyToOne(() => CraftsmanProfile)
  @JoinColumn({ name: 'craftsman_id' })
  craftsman: CraftsmanProfile;

  @Column({ name: 'contractor_id', type: 'uuid' })
  contractorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'contractor_id' })
  contractor: User;

  @Column({ name: 'last_message_at', type: 'timestamptz', nullable: true })
  lastMessageAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
