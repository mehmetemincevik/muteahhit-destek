import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
