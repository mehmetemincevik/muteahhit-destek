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
import { User } from '../../users/entities/user.entity';
import { Land } from './land.entity';
import { Block } from '../../units/entities/block.entity';

export enum ProjectStatus {
  PLANNING = 'planning',
  CONSTRUCTION = 'construction',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contractor_id', type: 'uuid' })
  contractorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'contractor_id' })
  contractor: User;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 30, default: ProjectStatus.PLANNING })
  status: ProjectStatus;

  @Column({ name: 'estimated_occupancy_date', type: 'date', nullable: true })
  estimatedOccupancyDate?: Date;

  @Column({ name: 'actual_occupancy_date', type: 'date', nullable: true })
  actualOccupancyDate?: Date;

  @Column({ name: 'is_public', type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ name: 'public_note', type: 'text', nullable: true })
  publicNote?: string;

  @OneToMany(() => Block, (block) => block.project)
  blocks: Block[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
