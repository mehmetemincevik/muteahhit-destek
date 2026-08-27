import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// Authorization header'ındaki JWT'yi doğrular ve çözülen bilgiyi request.user'a yazar.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; role: string }) {
    // Dönen değer request.user olur (bkz. @CurrentUser decorator'ı).
    //
    // Rol, token içinden okunur; veritabanından tekrar doğrulanmaz. Bir kullanıcının
    // rolü değiştirilirse eski token süresi dolana kadar eski rolle çalışmaya devam eder.
    return { userId: payload.sub, role: payload.role };
  }
}
