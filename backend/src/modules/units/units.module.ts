import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from './entities/block.entity';
import { Unit } from './entities/unit.entity';
import { Buyer } from './entities/buyer.entity';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [TypeOrmModule.forFeature([Block, Unit, Buyer]), ProjectsModule],
  controllers: [UnitsController],
  providers: [UnitsService],
})
export class UnitsModule {}
