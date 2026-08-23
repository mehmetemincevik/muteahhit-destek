import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostCategory } from './entities/cost-category.entity';
import { CostItem } from './entities/cost-item.entity';
import { CostPayment } from './entities/cost-payment.entity';
import { AssetTransaction } from '../assets/entities/asset-transaction.entity';
import { CostsService } from './costs.service';
import { CostsController } from './costs.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CostCategory, CostItem, CostPayment, AssetTransaction]),
    ProjectsModule,
  ],
  controllers: [CostsController],
  providers: [CostsService],
})
export class CostsModule {}
