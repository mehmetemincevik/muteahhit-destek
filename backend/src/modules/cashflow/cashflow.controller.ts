import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CashflowService } from './cashflow.service';
import { CreateCashflowEntryDto } from './dto/create-cashflow-entry.dto';
import { MarkAsPaidDto } from './dto/mark-as-paid.dto';

type AuthUser = { userId: string; role: string };

// NOT: run-daily-accrual buradan kaldırıldı, ayrı bir sistem controller'ına taşındı
// (bkz. cashflow-system.controller.ts) -- kullanıcı auth'u ile sistem auth'unu karıştırmamak için.
@Controller('cashflow')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('contractor')
export class CashflowController {
  constructor(private readonly cashflowService: CashflowService) {}

  @Post('entries')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCashflowEntryDto) {
    return this.cashflowService.create(user.userId, dto);
  }

  @Get('entries')
  findAll(@CurrentUser() user: AuthUser) {
    return this.cashflowService.findAllForContractor(user.userId);
  }

  @Get('entries/:entryId')
  findOne(@Param('entryId') entryId: string, @CurrentUser() user: AuthUser) {
    return this.cashflowService.getEntryDetail(user.userId, entryId);
  }

  @Patch('entries/:entryId/mark-paid')
  markAsPaid(
    @Param('entryId') entryId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: MarkAsPaidDto,
  ) {
    return this.cashflowService.markAsPaid(user.userId, entryId, dto);
  }
}
