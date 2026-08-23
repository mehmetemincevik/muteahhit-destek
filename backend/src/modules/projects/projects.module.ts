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
  exports: [ProjectsService], // diğer modüller (örn. units) ProjectsService'i kullanabilsin diye
})
export class ProjectsModule {}
