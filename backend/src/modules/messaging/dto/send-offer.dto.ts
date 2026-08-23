import { IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class SendOfferDto {
  @IsOptional()
  @IsUUID()
  packageId?: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
