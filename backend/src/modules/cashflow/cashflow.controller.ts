import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CashflowService } from './cashflow.service';
import { CreateCashflowEntryDto } from './dto/create-cashflow-entry.dto';
import { MarkAsPaidDto } from './dto/mark-as-paid.dto';

type AuthUser = { userId: string; role: string };

@Controller('cashflow')
@UseGuards(JwtAuthGuard)
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

  // n8n (ya da manuel test) tarafından günde bir kez tetiklenecek.
  // NOT: Bilerek @CurrentUser() KULLANMIYORUZ -- bu tüm müteahhitler için toplu çalışan
  // sistem geneli bir işlem, tek bir kullanıcıya özel değil.
  @Post('run-daily-accrual')
  runDailyAccrual() {
    return this.cashflowService.runDailyAccrual();
  }
}
