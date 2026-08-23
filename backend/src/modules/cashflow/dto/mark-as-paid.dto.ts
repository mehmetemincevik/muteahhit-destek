import { IsDateString, IsOptional, IsString } from 'class-validator';

export class MarkAsPaidDto {
  @IsDateString()
  paidDate: string;

  // Sadece installment_payment/check/other için anlamlı (units.payments'taki payment_method ile aynı)
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
