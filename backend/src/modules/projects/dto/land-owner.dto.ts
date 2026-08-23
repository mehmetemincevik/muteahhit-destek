import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class LandOwnerDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  sharePercentage?: number;

  @IsOptional()
  @IsString()
  tcOrVkn?: string;
}
