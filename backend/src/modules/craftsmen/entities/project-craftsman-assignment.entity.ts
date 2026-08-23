import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { CraftsmanProfile } from './craftsman-profile.entity';
import { CraftsmanServicePackage } from './craftsman-service-package.entity';

export enum AssignmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('project_craftsman_assignments')
export class ProjectCraftsmanAssignment {
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

  @Column({ name: 'package_id', type: 'uuid', nullable: true })
  packageId?: string;

  @ManyToOne(() => CraftsmanServicePackage, { nullable: true })
  @JoinColumn({ name: 'package_id' })
  package?: CraftsmanServicePackage;

  @Column({ name: 'agreed_price', type: 'numeric', precision: 14, scale: 2, nullable: true })
  agreedPrice?: number;

  @Column({ type: 'varchar', length: 20, default: AssignmentStatus.ACTIVE })
  status: AssignmentStatus;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
