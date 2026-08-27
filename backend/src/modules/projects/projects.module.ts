import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Land } from './entities/land.entity';
import { LandOwner } from './entities/land-owner.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Land, LandOwner])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService], // proje sahipliği doğrulaması için diğer modüllerde kullanılıyor
})
export class ProjectsModule {}
