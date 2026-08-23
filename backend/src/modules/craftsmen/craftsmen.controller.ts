import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
@UseGuards(JwtAuthGuard)
export class CraftsmenController {
  constructor(private readonly craftsmenService: CraftsmenService) {}

  // --- Profil (usta kendi profilini yönetir) ---

  @Post('craftsmen/profile')
  upsertProfile(@CurrentUser() user: AuthUser, @Body() dto: UpsertProfileDto) {
    return this.craftsmenService.upsertProfile(user.userId, dto);
  }

  @Get('craftsmen/profile')
  getMyProfile(@CurrentUser() user: AuthUser) {
    return this.craftsmenService.getMyProfile(user.userId);
  }

  // --- Genel Arama (müteahhitler ustaları keşfeder -- herkese açık) ---

  @Get('craftsmen')
  findAll(@Query('province') province?: string, @Query('district') district?: string) {
    return this.craftsmenService.findAllProfiles({ province, district });
  }

  // ÖNEMLİ: 'craftsmen/my-assignments' gibi SABİT route'lar, aşağıdaki
  // 'craftsmen/:craftsmanId' gibi PARAMETRELİ route'lardan ÖNCE tanımlanmalı.
  // Yoksa NestJS "my-assignments" kelimesini craftsmanId parametresi sanıp yanlış
  // metodu (getProfileDetail) çağırır -- bu hatayı test sırasında yakaladık.
  @Get('craftsmen/my-assignments')
  findMyAssignments(@CurrentUser() user: AuthUser) {
    return this.craftsmenService.findAssignmentsForCraftsman(user.userId);
  }

  @Get('craftsmen/:craftsmanId')
  getProfileDetail(@Param('craftsmanId') craftsmanId: string) {
    return this.craftsmenService.getProfileDetail(craftsmanId);
  }

  // --- Hizmet Paketleri ---

  @Post('craftsmen/packages')
  createPackage(@CurrentUser() user: AuthUser, @Body() dto: CreatePackageDto) {
    return this.craftsmenService.createPackage(user.userId, dto);
  }

  @Post('craftsmen/packages/:packageId/items')
  addPackageItem(
    @Param('packageId') packageId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePackageItemDto,
  ) {
    return this.craftsmenService.addPackageItem(user.userId, packageId, dto);
  }

  // --- Portfolyo ---

  @Post('craftsmen/portfolio')
  addPortfolioImage(@CurrentUser() user: AuthUser, @Body() dto: AddPortfolioImageDto) {
    return this.craftsmenService.addPortfolioImage(user.userId, dto);
  }

  // --- Yorumlar ---

  @Post('craftsmen/reviews')
  createReview(@CurrentUser() user: AuthUser, @Body() dto: CreateReviewDto) {
    return this.craftsmenService.createReview(user.userId, dto);
  }

  // --- Proje Atamaları ---

  @Post('projects/:projectId/assignments')
  createAssignment(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.craftsmenService.createAssignment(user.userId, projectId, dto);
  }

  @Get('projects/:projectId/assignments')
  findAssignmentsByProject(@Param('projectId') projectId: string, @CurrentUser() user: AuthUser) {
    return this.craftsmenService.findAssignmentsByProject(user.userId, projectId);
  }

  @Patch('assignments/:assignmentId/status')
  updateAssignmentStatus(
    @Param('assignmentId') assignmentId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateAssignmentStatusDto,
  ) {
    return this.craftsmenService.updateAssignmentStatus(user.userId, assignmentId, dto);
  }
}
