import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { LandOwnerDto } from './dto/land-owner.dto';

type AuthUser = { userId: string; role: string };

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // Açık ilan listesi. Ustaların konuşma başlatabilmesi için projeleri keşfetmesi
  // gerekir; yalnızca tanıtıcı alanlar döner (bkz. public_project_listings).
  //
  // Sabit segmentli yol, aşağıdaki ':id' route'undan önce tanımlanmalıdır.
  @Get('public')
  @Roles('craftsman', 'contractor')
  findPublicListings() {
    return this.projectsService.findPublicListings();
  }

  @Post()
  @Roles('contractor')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(user.userId, dto);
  }

  @Get()
  @Roles('contractor')
  findAll(@CurrentUser() user: AuthUser) {
    return this.projectsService.findAllForContractor(user.userId);
  }

  @Get(':id')
  @Roles('contractor')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.projectsService.findOneForContractor(id, user.userId);
  }

  @Patch(':id')
  @Roles('contractor')
  update(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(user.userId, id, dto);
  }

  @Get(':id/land-owners')
  @Roles('contractor')
  findLandOwners(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.projectsService.findLandOwners(user.userId, id);
  }

  @Post(':id/land-owners')
  @Roles('contractor')
  addLandOwner(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: LandOwnerDto) {
    return this.projectsService.addLandOwner(user.userId, id, dto);
  }
}
