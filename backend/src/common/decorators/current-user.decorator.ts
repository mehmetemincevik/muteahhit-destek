import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// JwtStrategy.validate() çıktısını ({ userId, role }) controller metoduna parametre
// olarak aktarır. JwtAuthGuard'ın çalıştığı uçlarda kullanılır; korumasız bir uçta
// undefined döner.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // JwtStrategy.validate()'in dönüş değeri
  },
);
