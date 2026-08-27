import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

type AuthUser = { userId: string; role: string };

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('contractor') // Ödeme kayıtları sadece müteahhide ait finansal veri
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // POST /units/:unitId/payments
  @Post('units/:unitId/payments')
  create(
    @Param('unitId') unitId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(user.userId, unitId, dto);
  }

  // GET /units/:unitId/payments
  @Get('units/:unitId/payments')
  findByUnit(@Param('unitId') unitId: string, @CurrentUser() user: AuthUser) {
    return this.paymentsService.findByUnit(user.userId, unitId);
  }

  // GET /units/:unitId/balance
  @Get('units/:unitId/balance')
  getBalance(@Param('unitId') unitId: string, @CurrentUser() user: AuthUser) {
    return this.paymentsService.getBalance(user.userId, unitId);
  }
}
