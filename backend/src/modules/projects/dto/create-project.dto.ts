import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { LandOwnerDto } from './land-owner.dto';

// Proje, arsa ve arsa sahipleri tek istekte oluşturulur; üçü de aynı transaction
// içinde kaydedilir (bkz. ProjectsService.create).
export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsDateString()
  estimatedOccupancyDate?: string;

  // Arsa alanları. Hiçbiri gönderilmezse land kaydı oluşturulmaz.
  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  adaNo?: string;

  @IsOptional()
  @IsString()
  parselNo?: string;

  @IsOptional()
  @IsNumber()
  areaM2?: number;

  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @IsOptional()
  @IsBoolean()
  isKatKarsiligi?: boolean;

  // Hisseli tapuda birden fazla sahip olabilir.
  // Sınırlama: hisse oranları toplamının %100 olduğu doğrulanmıyor.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LandOwnerDto)
  owners?: LandOwnerDto[];
}
