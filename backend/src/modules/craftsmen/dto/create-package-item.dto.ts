import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PriceType } from '../entities/craftsman-service-package.entity';

export class CreatePackageItemDto {
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsOptional()
  @IsEnum(PriceType)
  priceType?: PriceType;

  @IsOptional()
  @IsNumber()
  priceAmount?: number;
}
