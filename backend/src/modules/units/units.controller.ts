import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UnitsService } from './units.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitStatusDto } from './dto/update-unit-status.dto';

type AuthUser = { userId: string; role: string };

@Controller()
@UseGuards(JwtAuthGuard)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

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
