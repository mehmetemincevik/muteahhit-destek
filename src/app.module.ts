import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { UnitsModule } from './modules/units/units.module';

@Module({
  imports: [
    // .env dosyasını okuyup process.env üzerinden erişilebilir yapar, tüm modüllerde kullanılabilir
    ConfigModule.forRoot({ isGlobal: true }),

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

    // ============================================
    // TODO -- SIRADAKİ MODÜLLER (aynı desenle eklenecek, şema dosyaları hazır):
    //   PaymentsModule    (02_payments.sql)
    //   CostsModule       (03_costs.sql)
    //   AssetsModule      (04_assets.sql)
    //   CashflowModule    (05_cashflow.sql)
    //   CraftsmenModule   (06_craftsmen.sql)
    //   MessagingModule   (07_offers_messaging.sql)
    //   TemplatesModule   (08_templates.sql)
    // Her biri için: entities/ klasörü + dto/ + service + controller + module dosyası,
    // ProjectsModule/UnitsModule'deki desenin birebir aynısı izlenerek eklenir.
    // ============================================
  ],
})
export class AppModule {}
