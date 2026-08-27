import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Bu guard, JWT/kullanıcı hesabı GEREKTİRMEYEN, sistem-sistem çağrıları için kullanılır
// (örn. n8n'in günlük faiz işletme endpoint'ini tetiklemesi). Kullanıcı bir "Bearer token"
// yerine, isteğin header'ında sabit bir "X-API-Key" göndermeli.
//
// NEDEN AYRI BİR GUARD? JwtAuthGuard, bir KULLANICININ kimliğini doğrular (login olmuş biri).
// Ama n8n bir kullanıcı değil, bir otomasyon aracı -- onun için "kullanıcı girişi" kavramı
// hiç uygun değil. Bu yüzden tamamen farklı, daha basit bir doğrulama mekanizması kullanıyoruz:
// sadece "bu isteği gönderen, gizli anahtarı biliyor mu?" sorusuna bakıyoruz.
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const providedKey = request.headers['x-api-key'];
    const expectedKey = this.configService.get<string>('SYSTEM_API_KEY');

    if (!expectedKey) {
      // .env'de SYSTEM_API_KEY tanımlanmamışsa, güvenlik açığı oluşturmamak için
      // bu endpoint'i TAMAMEN kapatıyoruz (izin vermek yerine reddediyoruz).
      throw new UnauthorizedException('Sistem API anahtarı sunucuda yapılandırılmamış');
    }

    if (!providedKey || providedKey !== expectedKey) {
      throw new UnauthorizedException('Geçersiz ya da eksik API anahtarı (X-API-Key header)');
    }

    return true;
  }
}
