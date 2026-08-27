import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { CashflowService } from './cashflow.service';

// Sistem uçları. Kullanıcı oturumu değil, X-API-Key doğrulaması kullanır.
//
// Faiz tahakkuku normalde uygulama içi zamanlayıcıyla çalışır
// (CashflowService.handleDailyAccrualCron). Buradaki uç manuel tetikleme içindir:
// test veya sunucunun kapalı kaldığı bir günün telafisi.
@Controller('system/cashflow')
@UseGuards(ApiKeyGuard)
export class CashflowSystemController {
  constructor(private readonly cashflowService: CashflowService) {}

  // POST /system/cashflow/run-daily-accrual
  // Header: X-API-Key: <SYSTEM_API_KEY>
  //
  // Aynı gün içinde tekrar çağrılması güvenlidir; mükerrer tahakkuk benzersiz kısıtla
  // engellenir (bkz. runDailyAccrual).
  @Post('run-daily-accrual')
  runDailyAccrual() {
    return this.cashflowService.runDailyAccrual();
  }
}
