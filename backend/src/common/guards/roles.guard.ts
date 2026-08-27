import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

// @Roles() ile belirtilen rolleri doğrular. JwtAuthGuard'dan sonra sıralanmalıdır;
// request.user'ın dolu olmasına bağımlıdır.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Metot seviyesindeki tanım, class seviyesindekini geçersiz kılar.
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // İşaret yoksa rol kısıtlaması uygulanmaz.
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
