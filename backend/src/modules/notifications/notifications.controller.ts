import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

type AuthUser = { userId: string; role: string };

// Rol kısıtı yok: her iki rol de kendi sayaçlarını okur, sorgular kullanıcıya göre filtrelenir.
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: AuthUser) {
    return this.notificationsService.getSummary(user);
  }

  @Get('unread-by-conversation')
  getUnreadByConversation(@CurrentUser() user: AuthUser) {
    return this.notificationsService.getUnreadCountsByConversation(user);
  }
}
