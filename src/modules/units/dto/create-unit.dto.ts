import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUnitDto {
  @IsInt()
  floorNo: number;

  @IsString()
  @IsNotEmpty()
  unitNo: string;

  @IsOptional()
  @IsString()
  roomLayout?: string; // "3+1" gibi

  @IsOptional()
  @IsNumber()
  grossM2?: number;

  @IsOptional()
  @IsNumber()
  netM2?: number;

  @IsOptional()
  @IsNumber()
  salePrice?: number;
}
