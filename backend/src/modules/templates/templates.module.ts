import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicePackageTemplate } from './entities/service-package-template.entity';
import { ServicePackageTemplateItem } from './entities/service-package-template-item.entity';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServicePackageTemplate, ServicePackageTemplateItem])],
  controllers: [TemplatesController],
  providers: [TemplatesService],
})
export class TemplatesModule {}
