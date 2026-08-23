import { IsDateString, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateRentalDto {
  @IsOptional()
  @IsString()
  tenantName?: string;

  @IsOptional()
  @IsString()
  tenantPhone?: string;

  @IsNumber()
  @IsPositive()
  monthlyRent: number;

  @IsOptional()
  @IsDateString()
  contractStartDate?: string;

  @IsOptional()
  @IsDateString()
  contractEndDate?: string;
}
