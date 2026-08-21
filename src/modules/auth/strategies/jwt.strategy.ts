import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// Bu sınıf, gelen isteklerin Authorization header'ındaki JWT token'ını doğrular.
// Token geçerliyse, içindeki bilgiyi (sub=userId, role) req.user olarak controller'lara sunar.
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
    // Burada dönen obje, her korumalı endpoint'te req.user olarak erişilebilir olacak.
    return { userId: payload.sub, role: payload.role };
  }
}
