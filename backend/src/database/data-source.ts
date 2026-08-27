import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

// TypeORM CLI yapılandırması. migration:run / migration:revert / migration:show
// komutları bu dosyadan bağlantı bilgisini okur.
// Uygulama çalışma zamanı bağlantısı ayrı tanımlıdır (app.module.ts).
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'muteahhit_db',

  // Modül klasörlerindeki entity dosyaları desen ile taranır.
  entities: ['src/modules/**/entities/*.entity.ts'],

  // Migration dosyaları
  migrations: ['src/database/migrations/*.ts'],

  // synchronize false kalmalı. Açık olduğunda TypeORM şemayı entity tanımlarına göre
  // yeniden düzenler ve elle yazılmış CHECK constraint'leri ile view'ları bozar.
  // Şema değişiklikleri yalnızca migration ile yapılır.
  synchronize: false,

  logging: process.env.NODE_ENV === 'development',
});
