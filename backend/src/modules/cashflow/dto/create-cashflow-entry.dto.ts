import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { CashflowEntryType, CashflowDirection } from '../entities/cashflow-calendar.entity';

export class CreateCashflowEntryDto {
  @IsEnum(CashflowEntryType)
  entryType: CashflowEntryType;

  @IsEnum(CashflowDirection)
  direction: CashflowDirection;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsPositive()
  originalAmount: number;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1, { message: 'Günlük faiz oranı ondalık olmalı (örn. %0,14 için 0.0014), yüzde değil' })
  dailyInterestRate?: number;

  // entryType='installment_payment' ise hangi daireye ait olduğunu belirtir (opsiyonel --
  // ödeme gerçekleştiğinde markAsPaid'de zorunlu hale gelir, bkz. CashflowService)
  @IsOptional()
  @IsUUID()
  unitId?: string;

  // entryType='rent' için kira sözleşmesi referansı
  @IsOptional()
  @IsUUID()
  rentalId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
