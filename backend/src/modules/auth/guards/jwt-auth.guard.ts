import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Bir controller/endpoint'i korumak için @UseGuards(JwtAuthGuard) şeklinde kullanılır.
// Token yoksa veya geçersizse otomatik olarak 401 Unauthorized döner.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
