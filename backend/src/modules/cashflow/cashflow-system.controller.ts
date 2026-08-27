import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { CashflowService } from './cashflow.service';

// Bu controller, KULLANICI hesabı GEREKTİRMEZ -- sadece geçerli bir X-API-Key header'ı ister.
//
// NOT: Faiz işletme artık OTOMATİK olarak uygulamanın kendi zamanlayıcısı ile her gece
// çalışıyor (bkz. CashflowService.handleDailyAccrualCron, @nestjs/schedule kullanıyor).
// n8n'e (ya da başka bir dış tetikleyiciye) ARTIK ZORUNLU OLARAK ihtiyaç yok. Bu endpoint
// sadece MANUEL tetikleme için duruyor -- örn. test etmek istediğinde, ya da sunucu bir gün
// kapalıyken kaçırılan bir günü elle telafi etmek istediğinde.
@Controller('system/cashflow')
@UseGuards(ApiKeyGuard)
export class CashflowSystemController {
  constructor(private readonly cashflowService: CashflowService) {}

  // Manuel/test tetikleme:
  // curl -X POST https://senin-sunucun/system/cashflow/run-daily-accrual \
  //   -H "X-API-Key: .env'deki SYSTEM_API_KEY değeri"
  @Post('run-daily-accrual')
  runDailyAccrual() {
    return this.cashflowService.runDailyAccrual();
  }
}
