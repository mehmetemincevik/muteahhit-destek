import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CraftsmenService } from './craftsmen.service';
import { UpsertProfileDto } from './dto/upsert-profile.dto';
import { CreatePackageDto } from './dto/create-package.dto';
import { CreatePackageItemDto } from './dto/create-package-item.dto';
import { AddPortfolioImageDto } from './dto/add-portfolio-image.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentStatusDto } from './dto/update-assignment-status.dto';

type AuthUser = { userId: string; role: string };

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CraftsmenController {
  constructor(private readonly craftsmenService: CraftsmenService) {}

  // Profil: usta yalnızca kendi kaydını yönetir.

  @Post('craftsmen/profile')
  @Roles('craftsman')
  upsertProfile(@CurrentUser() user: AuthUser, @Body() dto: UpsertProfileDto) {
    return this.craftsmenService.upsertProfile(user.userId, dto);
  }

  @Get('craftsmen/profile')
  @Roles('craftsman')
  getMyProfile(@CurrentUser() user: AuthUser) {
    return this.craftsmenService.getMyProfile(user.userId);
  }

  // Usta arama ve profil görüntüleme.

  @Get('craftsmen')
  @Roles('contractor')
  findAll(@Query('province') province?: string, @Query('district') district?: string) {
    return this.craftsmenService.findAllProfiles({ province, district });
  }

  // Sabit segmentli route'lar parametreli olanlardan önce tanımlanmalı; aksi halde
  // ':craftsmanId' bu yolu da yakalar ve 'my-assignments' ID olarak yorumlanır.
  @Get('craftsmen/my-assignments')
  @Roles('craftsman')
  findMyAssignments(@CurrentUser() user: AuthUser) {
    return this.craftsmenService.findAssignmentsForCraftsman(user.userId);
  }

  @Get('craftsmen/:craftsmanId')
  @Roles('contractor')
  getProfileDetail(@Param('craftsmanId') craftsmanId: string) {
    return this.craftsmenService.getProfileDetail(craftsmanId);
  }

  // Hizmet paketleri: usta yalnızca kendi paketlerini düzenler.

  @Post('craftsmen/packages')
  @Roles('craftsman')
  createPackage(@CurrentUser() user: AuthUser, @Body() dto: CreatePackageDto) {
    return this.craftsmenService.createPackage(user.userId, dto);
  }

  @Post('craftsmen/packages/:packageId/items')
  @Roles('craftsman')
  addPackageItem(
    @Param('packageId') packageId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePackageItemDto,
  ) {
    return this.craftsmenService.addPackageItem(user.userId, packageId, dto);
  }

  // Portfolyo görselleri.

  @Post('craftsmen/portfolio')
  @Roles('craftsman')
  addPortfolioImage(@CurrentUser() user: AuthUser, @Body() dto: AddPortfolioImageDto) {
    return this.craftsmenService.addPortfolioImage(user.userId, dto);
  }

  // Değerlendirmeler: yalnızca müteahhit yazar.

  @Post('craftsmen/reviews')
  @Roles('contractor')
  createReview(@CurrentUser() user: AuthUser, @Body() dto: CreateReviewDto) {
    return this.craftsmenService.createReview(user.userId, dto);
  }

  // Proje atamaları.

  @Post('projects/:projectId/assignments')
  @Roles('contractor')
  createAssignment(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.craftsmenService.createAssignment(user.userId, projectId, dto);
  }

  @Get('projects/:projectId/assignments')
  @Roles('contractor')
  findAssignmentsByProject(@Param('projectId') projectId: string, @CurrentUser() user: AuthUser) {
    return this.craftsmenService.findAssignmentsByProject(user.userId, projectId);
  }

  @Patch('assignments/:assignmentId/status')
  @Roles('contractor')
  updateAssignmentStatus(
    @Param('assignmentId') assignmentId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateAssignmentStatusDto,
  ) {
    return this.craftsmenService.updateAssignmentStatus(user.userId, assignmentId, dto);
  }
}
