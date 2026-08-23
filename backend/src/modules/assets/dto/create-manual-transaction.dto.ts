import { IsDateString, IsIn, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateManualTransactionDto {
  @IsIn(['manual_addition', 'manual_deduction'], {
    message: 'direction sadece manual_addition veya manual_deduction olabilir',
  })
  direction: 'manual_addition' | 'manual_deduction';

  @IsNumber()
  @IsPositive({ message: 'Tutar sıfırdan büyük olmalı (yön zaten ekleme/çıkarma belirtiyor)' })
  amount: number;

  @IsDateString()
  transactionDate: string;

  @IsOptional()
  @IsString()
  description?: string;
}
