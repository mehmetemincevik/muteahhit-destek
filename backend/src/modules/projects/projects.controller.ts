import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('contractor') // Sadece müteahhitler proje oluşturabilir/görebilir
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // POST /projects
  @Post()
  create(
    @CurrentUser() user: { userId: string; role: string },
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(user.userId, dto);
  }

  // GET /projects  -> sadece giriş yapan müteahhidin kendi projeleri
  @Get()
  findAll(@CurrentUser() user: { userId: string; role: string }) {
    return this.projectsService.findAllForContractor(user.userId);
  }

  // GET /projects/:id
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return this.projectsService.findOneForContractor(id, user.userId);
  }
}
