import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Oturum gerektiren uçlarda @UseGuards(JwtAuthGuard) ile kullanılır.
// Token yok veya geçersizse 401 döner.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
