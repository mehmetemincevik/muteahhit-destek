import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashflowCalendar } from './entities/cashflow-calendar.entity';
import { CashflowInterestAccrual } from './entities/cashflow-interest-accrual.entity';
import { AssetTransaction } from '../assets/entities/asset-transaction.entity';
import { CashflowService } from './cashflow.service';
import { CashflowController } from './cashflow.controller';
import { CashflowSystemController } from './cashflow-system.controller';
import { PaymentsModule } from '../payments/payments.module';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CashflowCalendar, CashflowInterestAccrual, AssetTransaction]),
    PaymentsModule, // markAsPaid -> installment_payment
    AssetsModule, // markAsPaid -> rent
  ],
  controllers: [CashflowController, CashflowSystemController],
  providers: [CashflowService],
})
export class CashflowModule {}
