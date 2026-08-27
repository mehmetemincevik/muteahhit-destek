import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UnitsService } from './units.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateUnitStatusDto } from './dto/update-unit-status.dto';

type AuthUser = { userId: string; role: string };

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('contractor') // Blok/daire yönetimi sadece müteahhide ait
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  // --- Alıcılar ---

  // POST /buyers
  @Post('buyers')
  createBuyer(@CurrentUser() user: AuthUser, @Body() dto: CreateBuyerDto) {
    return this.unitsService.createBuyer(user.userId, dto);
  }

  // GET /buyers  -> sadece giriş yapan müteahhidin kendi alıcıları
  @Get('buyers')
  findBuyers(@CurrentUser() user: AuthUser) {
    return this.unitsService.findBuyers(user.userId);
  }

  // POST /projects/:projectId/blocks
  @Post('projects/:projectId/blocks')
  createBlock(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateBlockDto,
  ) {
    return this.unitsService.createBlock(user.userId, projectId, dto);
  }

  // GET /projects/:projectId/blocks  (bloklar + içindeki daireler)
  @Get('projects/:projectId/blocks')
  findByProject(@Param('projectId') projectId: string, @CurrentUser() user: AuthUser) {
    return this.unitsService.findByProject(user.userId, projectId);
  }

  // POST /blocks/:blockId/units
  @Post('blocks/:blockId/units')
  createUnit(
    @Param('blockId') blockId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateUnitDto,
  ) {
    return this.unitsService.createUnit(user.userId, blockId, dto);
  }

  // PATCH /units/:unitId/status
  @Patch('units/:unitId/status')
  updateStatus(
    @Param('unitId') unitId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateUnitStatusDto,
  ) {
    return this.unitsService.updateStatus(user.userId, unitId, dto);
  }
}
