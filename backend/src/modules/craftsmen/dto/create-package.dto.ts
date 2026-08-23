import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { PriceType } from '../entities/craftsman-service-package.entity';

export class CreatePackageDto {
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PriceType)
  priceType?: PriceType;

  @IsOptional()
  @IsNumber()
  priceAmount?: number;
}
