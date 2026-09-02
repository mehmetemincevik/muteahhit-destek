import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Yüklenen görseller /uploads altından servis edilir. Dosyalar kimlik doğrulaması
  // olmadan erişilebilir; adresler rastgele UUID içerdiği için tahmin edilemez, ancak
  // adresi bilen herkes görüntüleyebilir. Gizlilik gerektiren içerik için imzalı adres
  // veya erişim kontrolü eklenmeli.
  app.useStaticAssets(join(process.cwd(), process.env.UPLOAD_DIR || 'uploads'), {
    prefix: '/uploads',
  });

  // DTO doğrulaması tüm uçlarda otomatik uygulanır.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO'da tanımsız alanları gövdeden ayıklar
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // TODO: CORS şu an tüm kaynaklara açık. Üretimde origin listesi kısıtlanmalı.
  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend çalışıyor: http://localhost:${port}`);
}
bootstrap();
