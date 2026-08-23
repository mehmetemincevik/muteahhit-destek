import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { CostPaymentMethod } from '../entities/cost-payment.entity';

export class CreateCostPaymentDto {
  @IsNumber()
  @IsPositive({ message: 'Ödeme tutarı sıfırdan büyük olmalı' })
  amount: number;

  @IsDateString()
  paymentDate: string;

  @IsOptional()
  @IsEnum(CostPaymentMethod)
  paymentMethod?: CostPaymentMethod;

  @IsOptional()
  @IsString()
  note?: string;
}
