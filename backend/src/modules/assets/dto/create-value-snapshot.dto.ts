import { IsDateString, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateValueSnapshotDto {
  @IsNumber()
  @IsPositive()
  estimatedValue: number;

  @IsDateString()
  snapshotDate: string;

  @IsOptional()
  @IsString()
  source?: string;
}
