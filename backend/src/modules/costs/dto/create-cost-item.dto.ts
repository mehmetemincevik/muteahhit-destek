import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { CostSource } from '../entities/cost-item.entity';

export class CreateCostItemDto {
  @IsUUID()
  categoryId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsNumber()
  @IsPositive({ message: 'Toplam maliyet sıfırdan büyük olmalı' })
  totalCost: number;

  @IsOptional()
  @IsEnum(CostSource)
  source?: CostSource;

  @IsOptional()
  @IsObject()
  extraSpecs?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  incurredDate?: string;
}
