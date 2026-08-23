import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Unit } from '../units/entities/unit.entity';
import { AssetTransaction } from '../assets/entities/asset-transaction.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Unit, AssetTransaction])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService], // CashflowModule bunu markAsPaid için kullanacak
})
export class PaymentsModule {}
