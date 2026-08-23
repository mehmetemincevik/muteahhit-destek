import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { AssetRental } from './entities/asset-rental.entity';
import { RentalPayment } from './entities/rental-payment.entity';
import { AssetValueSnapshot } from './entities/asset-value-snapshot.entity';
import { AssetTransaction } from './entities/asset-transaction.entity';
import { AssetsService } from './assets.service';
import { AssetsController, RentalsController } from './assets.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, AssetRental, RentalPayment, AssetValueSnapshot, AssetTransaction]),
  ],
  controllers: [AssetsController, RentalsController],
  providers: [AssetsService],
  exports: [AssetsService], // CashflowModule bunu markAsPaid için kullanacak
})
export class AssetsModule {}
