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

// Bu DTO, wireframe'deki "Yeni Proje Oluştur" ekranının tamamını tek istekte karşılar:
// proje bilgisi + arsa bilgisi + (varsa) birden fazla arsa sahibi aynı anda gönderilir.
export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsDateString()
  estimatedOccupancyDate?: string;

  // --- Arsa bilgisi ---
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

  // --- Arsa sahipleri (hisseli olabilir, birden fazla girilebilir) ---
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LandOwnerDto)
  owners?: LandOwnerDto[];
}
