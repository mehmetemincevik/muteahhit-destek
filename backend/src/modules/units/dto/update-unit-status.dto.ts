import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { UnitOwnershipStatus } from '../entities/unit.entity';

export class UpdateUnitStatusDto {
  @IsEnum(UnitOwnershipStatus)
  status: UnitOwnershipStatus;

  // status='sold' iken zorunlu, diğer durumlarda gönderilmemeli
  @IsOptional()
  @IsUUID()
  buyerId?: string;

  // status='given_to_land_owner' iken zorunlu, diğer durumlarda gönderilmemeli
  @IsOptional()
  @IsUUID()
  landOwnerId?: string;
}
