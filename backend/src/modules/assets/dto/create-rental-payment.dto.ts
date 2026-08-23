import { IsDateString, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateRentalPaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsDateString()
  paymentDate: string;

  @IsOptional()
  @IsString()
  note?: string;
}
