import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { UnitOwnershipStatus } from '../entities/unit.entity';

export class UpdateUnitStatusDto {
  @IsEnum(UnitOwnershipStatus)
  status: UnitOwnershipStatus;

  // status='sold' için zorunlu, diğer durumlarda yok sayılır
  @IsOptional()
  @IsUUID()
  buyerId?: string;

  // status='given_to_land_owner' için zorunlu, diğer durumlarda yok sayılır
  @IsOptional()
  @IsUUID()
  landOwnerId?: string;
}
