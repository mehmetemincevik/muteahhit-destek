import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

// Bu dosya iki amaçla kullanılır:
// 1) migration:run / migration:revert komutları bunu okuyarak veritabanına bağlanır
// 2) app.module.ts içindeki TypeOrmModule de benzer ayarları (env üzerinden) kullanır
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'muteahhit_db',

  // Entity dosyalarını otomatik bulur (her modülün entities/ klasörü)
  entities: ['src/modules/**/entities/*.entity.ts'],

  // Migration dosyalarını otomatik bulur (şemamızı buraya SQL olarak taşıyacağız)
  migrations: ['src/database/migrations/*.ts'],

  // ÖNEMLİ: synchronize HER ZAMAN false kalmalı. true olursa TypeORM entity'lere bakıp
  // veritabanını "kendi kafasına göre" değiştirir -- elle tasarladığımız CHECK constraint'leri,
  // view'ları vb. bozabilir. Biz her değişikliği migration dosyasıyla kontrollü yapacağız.
  synchronize: false,

  logging: process.env.NODE_ENV === 'development',
});
