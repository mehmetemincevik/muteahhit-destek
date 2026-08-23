import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Gelen her istekte DTO'lardaki class-validator kurallarını otomatik uygular
  // (örn. email formatı yanlışsa, zorunlu alan boşsa otomatik 400 hatası döner)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO'da tanımlı olmayan alanları isteklerden otomatik siler (güvenlik)
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors(); // Mobil uygulamanın API'ye erişebilmesi için

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend çalışıyor: http://localhost:${port}`);
}
bootstrap();
