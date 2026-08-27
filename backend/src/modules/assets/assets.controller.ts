import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { CreateManualTransactionDto } from './dto/create-manual-transaction.dto';
import { CreateRentalDto } from './dto/create-rental.dto';
import { CreateRentalPaymentDto } from './dto/create-rental-payment.dto';
import { CreateValueSnapshotDto } from './dto/create-value-snapshot.dto';

type AuthUser = { userId: string; role: string };

@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('contractor') // Varlıklar sadece müteahhide ait kişisel finansal veri
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAssetDto) {
    return this.assetsService.createAsset(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.assetsService.findAssetsForContractor(user.userId);
  }

  @Get(':assetId')
  findOne(@Param('assetId') assetId: string, @CurrentUser() user: AuthUser) {
    return this.assetsService.getAssetDetail(user.userId, assetId);
  }

  @Post(':assetId/transactions')
  addManualTransaction(
    @Param('assetId') assetId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateManualTransactionDto,
  ) {
    return this.assetsService.addManualTransaction(user.userId, assetId, dto);
  }

  @Post(':assetId/rentals')
  createRental(
    @Param('assetId') assetId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateRentalDto,
  ) {
    return this.assetsService.createRental(user.userId, assetId, dto);
  }

  @Post(':assetId/value-snapshots')
  addValueSnapshot(
    @Param('assetId') assetId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateValueSnapshotDto,
  ) {
    return this.assetsService.addValueSnapshot(user.userId, assetId, dto);
  }
}

// Kira ödemesi, rental'a bağlı olduğu için ayrı bir controller'da (URL kökü farklı: /rentals/...)
@Controller('rentals')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('contractor')
export class RentalsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post(':rentalId/payments')
  addPayment(
    @Param('rentalId') rentalId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateRentalPaymentDto,
  ) {
    return this.assetsService.addRentalPayment(user.userId, rentalId, dto);
  }
}
