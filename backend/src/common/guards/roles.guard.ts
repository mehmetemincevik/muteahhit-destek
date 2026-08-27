import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Bu guard, JwtAuthGuard'DAN SONRA çalışmalı (request.user'ın zaten dolu olması lazım).
// @Roles() decorator'ıyla işaretlenen controller/metotlarda, giriş yapan kullanıcının
// rolünün izin verilenler arasında olup olmadığını kontrol eder.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Hem metot hem class seviyesindeki @Roles()'u kontrol eder (metot varsa o öncelikli)
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // @Roles() hiç kullanılmamışsa -> kısıtlama yok, herkese açık
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // JwtAuthGuard'ın request.user'a yazdığı { userId, role }

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Bu işlem için gerekli rol: ${requiredRoles.join(' veya ')}`,
      );
    }

    return true;
  }
}
