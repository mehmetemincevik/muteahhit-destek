import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CostsService } from './costs.service';
import { CreateCostCategoryDto } from './dto/create-cost-category.dto';
import { CreateCostItemDto } from './dto/create-cost-item.dto';
import { CreateCostPaymentDto } from './dto/create-cost-payment.dto';

type AuthUser = { userId: string; role: string };

@Controller()
@UseGuards(JwtAuthGuard)
export class CostsController {
  constructor(private readonly costsService: CostsService) {}

  // --- Kategoriler ---

  // POST /cost-categories
  @Post('cost-categories')
  createCategory(@Body() dto: CreateCostCategoryDto) {
    return this.costsService.createCategory(dto);
  }

  // GET /cost-categories
  @Get('cost-categories')
  findCategories() {
    return this.costsService.findCategories();
  }

  // --- Maliyet Kalemleri ---

  // POST /projects/:projectId/cost-items
  @Post('projects/:projectId/cost-items')
  createCostItem(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCostItemDto,
  ) {
    return this.costsService.createCostItem(user.userId, projectId, dto);
  }

  // GET /projects/:projectId/cost-items
  @Get('projects/:projectId/cost-items')
  findCostItemsByProject(@Param('projectId') projectId: string, @CurrentUser() user: AuthUser) {
    return this.costsService.findCostItemsByProject(user.userId, projectId);
  }

  // GET /projects/:projectId/cost-summary
  @Get('projects/:projectId/cost-summary')
  getProjectCostSummary(@Param('projectId') projectId: string, @CurrentUser() user: AuthUser) {
    return this.costsService.getProjectCostSummary(user.userId, projectId);
  }

  // --- Maliyet Ödemeleri ---

  // POST /cost-items/:costItemId/payments
  @Post('cost-items/:costItemId/payments')
  createCostPayment(
    @Param('costItemId') costItemId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCostPaymentDto,
  ) {
    return this.costsService.createCostPayment(user.userId, costItemId, dto);
  }

  // GET /cost-items/:costItemId/balance
  @Get('cost-items/:costItemId/balance')
  getCostItemBalance(@Param('costItemId') costItemId: string, @CurrentUser() user: AuthUser) {
    return this.costsService.getCostItemBalance(user.userId, costItemId);
  }
}
