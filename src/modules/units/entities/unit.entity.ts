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

// SQL'deki CHECK constraint ile birebir eşleşmeli:
// 'sold' -> buyer_id dolu, land_owner_id boş
// 'given_to_land_owner' -> land_owner_id dolu, buyer_id boş
// 'available' -> ikisi de boş
// Bu kural veritabanı seviyesinde zaten zorlanıyor (CHECK constraint), ama servis katmanında
// da aynı kuralı uygulamak lazım -- kullanıcıya veritabanı hatası göstermek yerine
// anlamlı bir hata mesajı vermek için (bkz. units.service.ts).
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
