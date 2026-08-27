import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Block } from './block.entity';
import { Buyer } from './buyer.entity';
import { LandOwner } from '../../projects/entities/land-owner.entity';

// Durum ile ilişki alanları arasındaki kural (veritabanında CHECK constraint olarak da tanımlı):
//   sold                -> buyerId dolu, landOwnerId boş
//   given_to_land_owner -> landOwnerId dolu, buyerId boş
//   available           -> ikisi de boş
// Yeni bir durum eklenirse constraint, DTO ve UnitsService.updateStatus birlikte güncellenmeli.
export enum UnitOwnershipStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  GIVEN_TO_LAND_OWNER = 'given_to_land_owner',
}

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'block_id', type: 'uuid' })
  blockId: string;

  @ManyToOne(() => Block, (block) => block.units)
  @JoinColumn({ name: 'block_id' })
  block: Block;

  @Column({ name: 'floor_no', type: 'int' })
  floorNo: number;

  @Column({ name: 'unit_no', type: 'varchar', length: 20 })
  unitNo: string;

  @Column({ name: 'room_layout', type: 'varchar', length: 20, nullable: true })
  roomLayout?: string; // "3+1" gibi

  @Column({ name: 'gross_m2', type: 'numeric', precision: 8, scale: 2, nullable: true })
  grossM2?: number;

  @Column({ name: 'net_m2', type: 'numeric', precision: 8, scale: 2, nullable: true })
  netM2?: number;

  @Column({
    name: 'ownership_status',
    type: 'varchar',
    length: 30,
    default: UnitOwnershipStatus.AVAILABLE,
  })
  ownershipStatus: UnitOwnershipStatus;

  @Column({ name: 'sale_price', type: 'numeric', precision: 14, scale: 2, nullable: true })
  salePrice?: number;

  @Column({
    name: 'estimated_sale_value',
    type: 'numeric',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  estimatedSaleValue?: number;

  @Column({ name: 'buyer_id', type: 'uuid', nullable: true })
  buyerId?: string;

  @ManyToOne(() => Buyer, { nullable: true })
  @JoinColumn({ name: 'buyer_id' })
  buyer?: Buyer;

  @Column({ name: 'land_owner_id', type: 'uuid', nullable: true })
  landOwnerId?: string;

  @ManyToOne(() => LandOwner, { nullable: true })
  @JoinColumn({ name: 'land_owner_id' })
  landOwner?: LandOwner;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
