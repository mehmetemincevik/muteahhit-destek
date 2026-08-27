import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { UnitsModule } from './modules/units/units.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CostsModule } from './modules/costs/costs.module';
import { AssetsModule } from './modules/assets/assets.module';
import { CashflowModule } from './modules/cashflow/cashflow.module';
import { CraftsmenModule } from './modules/craftsmen/craftsmen.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { TemplatesModule } from './modules/templates/templates.module';

@Module({
  imports: [
    // .env dosyasını okuyup process.env üzerinden erişilebilir yapar, tüm modüllerde kullanılabilir
    ConfigModule.forRoot({ isGlobal: true }),

    // Genel istek sınırlama: varsayılan olarak bir IP, 60 saniyede en fazla 20 istek atabilir.
    // Daha sıkı sınırlar (örn. login/register için) @Throttle() decorator'ıyla üzerine yazılır
    // (bkz. auth.controller.ts).
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 20 }]),

    // Uygulama içi zamanlayıcı -- n8n gibi dış bir araca ihtiyaç duymadan, @Cron() decorator'ı
    // ile işaretlenmiş metotların (bkz. CashflowService.handleDailyAccrualCron) otomatik
    // çalışmasını sağlar.
    ScheduleModule.forRoot(),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [__dirname + '/modules/**/entities/*.entity{.ts,.js}'],
        synchronize: false, // bkz. data-source.ts -- şema değişiklikleri SADECE migration ile yapılır
      }),
    }),

    AuthModule,
    ProjectsModule,
    UnitsModule,
    PaymentsModule,
    CostsModule,
    AssetsModule,
    CashflowModule,
    CraftsmenModule,
    MessagingModule,
    TemplatesModule,
    // Tüm 8 modül tamamlandı: Auth, Projects, Units, Payments, Costs, Assets,
    // Cashflow, Craftsmen, Messaging, Templates.
  ],
  providers: [
    // ThrottlerGuard'ı TÜM uygulamaya global olarak uygular (her endpoint istek sınırlamasına tabi)
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
