import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MessagingService } from './messaging.service';
import { StartConversationDto } from './dto/start-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { SendOfferDto } from './dto/send-offer.dto';

type AuthUser = { userId: string; role: string };

@Controller()
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('conversations')
  startOrGet(@CurrentUser() user: AuthUser, @Body() dto: StartConversationDto) {
    return this.messagingService.startOrGetConversation(user, dto);
  }

  @Get('conversations')
  findAll(@CurrentUser() user: AuthUser) {
    return this.messagingService.findConversationsForUser(user);
  }

  @Get('conversations/:conversationId/messages')
  getMessages(@Param('conversationId') conversationId: string, @CurrentUser() user: AuthUser) {
    return this.messagingService.getMessages(user, conversationId);
  }

  @Post('conversations/:conversationId/messages')
  sendMessage(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.sendMessage(user, conversationId, dto);
  }

  @Post('conversations/:conversationId/offers')
  sendOffer(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: SendOfferDto,
  ) {
    return this.messagingService.sendOffer(user, conversationId, dto);
  }

  @Patch('offers/:offerId/accept')
  acceptOffer(@Param('offerId') offerId: string, @CurrentUser() user: AuthUser) {
    return this.messagingService.acceptOffer(user, offerId);
  }

  @Patch('offers/:offerId/reject')
  rejectOffer(@Param('offerId') offerId: string, @CurrentUser() user: AuthUser) {
    return this.messagingService.rejectOffer(user, offerId);
  }

  @Post('offers/:offerId/counter')
  counterOffer(
    @Param('offerId') offerId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: SendOfferDto,
  ) {
    return this.messagingService.counterOffer(user, offerId, dto);
  }
}
