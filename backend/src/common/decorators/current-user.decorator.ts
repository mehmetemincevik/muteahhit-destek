import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Kullanımı: @CurrentUser() user yazarak, JwtStrategy.validate()'te dönen
// { userId, role } objesini doğrudan controller metoduna parametre olarak alabiliriz.
// Bu, her yerde `req.user` yazmak yerine daha temiz bir kullanım sağlar.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // JwtStrategy.validate()'in dönüş değeri
  },
);
