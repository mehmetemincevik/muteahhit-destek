import { IsDateString, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAssignmentDto {
  @IsUUID()
  craftsmanId: string;

  @IsOptional()
  @IsUUID()
  packageId?: string;

  @IsOptional()
  @IsNumber()
  agreedPrice?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
