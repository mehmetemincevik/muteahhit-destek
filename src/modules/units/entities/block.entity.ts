import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { Unit } from './unit.entity';

@Entity('blocks')
export class Block {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.blocks)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ name: 'floor_count', type: 'int', nullable: true })
  floorCount?: number;

  @OneToMany(() => Unit, (unit) => unit.block)
  units: Unit[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
