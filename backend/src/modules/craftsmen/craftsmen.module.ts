import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CraftsmanProfile } from './entities/craftsman-profile.entity';
import { CraftsmanServicePackage } from './entities/craftsman-service-package.entity';
import { ServicePackageItem } from './entities/service-package-item.entity';
import { CraftsmanPortfolioImage } from './entities/craftsman-portfolio-image.entity';
import { CraftsmanReview } from './entities/craftsman-review.entity';
import { ProjectCraftsmanAssignment } from './entities/project-craftsman-assignment.entity';
import { CraftsmenService } from './craftsmen.service';
import { CraftsmenController } from './craftsmen.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CraftsmanProfile,
      CraftsmanServicePackage,
      ServicePackageItem,
      CraftsmanPortfolioImage,
      CraftsmanReview,
      ProjectCraftsmanAssignment,
    ]),
    ProjectsModule,
  ],
  controllers: [CraftsmenController],
  providers: [CraftsmenService],
  exports: [CraftsmenService], // MessagingModule teklif kabulünde atama oluşturmak için kullanıyor
})
export class CraftsmenModule {}
