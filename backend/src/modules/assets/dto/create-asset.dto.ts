import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AssetType } from '../entities/asset.entity';

export class CreateAssetDto {
  @IsEnum(AssetType)
  assetType: AssetType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Sadece real_estate tipi için anlamlı, diğerlerinde gönderilmesine gerek yok
  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  roomLayout?: string;

  @IsOptional()
  @IsNumber()
  areaM2?: number;
}
