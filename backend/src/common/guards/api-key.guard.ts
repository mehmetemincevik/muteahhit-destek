import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Sistem-sistem çağrıları için kimlik doğrulama. Kullanıcı oturumu yerine sabit bir
// X-API-Key header'ı bekler; JwtAuthGuard'ın kullanıcı kavramı bu tür çağrılara uymuyor.
//
// Anahtar .env'deki SYSTEM_API_KEY ile karşılaştırılır ve düz metin olarak tutulur.
// Rotasyon, kapsam (scope) veya çoklu anahtar desteği yok.
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const providedKey = request.headers['x-api-key'];
    const expectedKey = this.configService.get<string>('SYSTEM_API_KEY');

    if (!expectedKey) {
      // Anahtar tanımlı değilse uç tamamen kapatılır; yapılandırma eksikliği
      // açık erişime dönüşmemeli.
      throw new UnauthorizedException('Sistem API anahtarı sunucuda yapılandırılmamış');
    }

    if (!providedKey || providedKey !== expectedKey) {
      throw new UnauthorizedException('Geçersiz ya da eksik API anahtarı (X-API-Key header)');
    }

    return true;
  }
}
