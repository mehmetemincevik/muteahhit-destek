import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { StorageModule } from './modules/storage/storage.module';
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
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    // .env değerlerini tüm modüllere açar.
    ConfigModule.forRoot({ isGlobal: true }),

    // Varsayılan istek sınırı: IP başına 60 saniyede 20 istek.
    // Uç bazında @Throttle() ile daraltılabilir (bkz. auth.controller.ts).
    //
    // Sınırlama: sayaç bellekte tutulur. Birden fazla instance çalıştırıldığında
    // limit her instance için ayrı işler; ortak bir store (Redis) gerekir.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 20 }]),

    // @Cron() ile işaretli metotları çalıştırır (bkz. CashflowService.handleDailyAccrualCron).
    //
    // Sınırlama: zamanlanmış iş her instance'ta ayrı tetiklenir. Yatay ölçeklemede
    // mükerrer çalışmayı önleyen bir kilit mekanizması gerekir. Faiz tahakkuku
    // tarafında bu, benzersiz kısıt sayesinde zararsız (bkz. runDailyAccrual).
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

    StorageModule,
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
    NotificationsModule,

  ],
  providers: [
    // Hız sınırı global olarak uygulanır.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
