"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const messaging_service_1 = require("./messaging.service");
const start_conversation_dto_1 = require("./dto/start-conversation.dto");
const send_message_dto_1 = require("./dto/send-message.dto");
const send_offer_dto_1 = require("./dto/send-offer.dto");
let MessagingController = class MessagingController {
    constructor(messagingService) {
        this.messagingService = messagingService;
    }
    startOrGet(user, dto) {
        return this.messagingService.startOrGetConversation(user, dto);
    }
    findAll(user) {
        return this.messagingService.findConversationsForUser(user);
    }
    getMessages(conversationId, user) {
        return this.messagingService.getMessages(user, conversationId);
    }
    sendMessage(conversationId, user, dto) {
        return this.messagingService.sendMessage(user, conversationId, dto);
    }
    sendOffer(conversationId, user, dto) {
        return this.messagingService.sendOffer(user, conversationId, dto);
    }
    acceptOffer(offerId, user) {
        return this.messagingService.acceptOffer(user, offerId);
    }
    rejectOffer(offerId, user) {
        return this.messagingService.rejectOffer(user, offerId);
    }
    counterOffer(offerId, user, dto) {
        return this.messagingService.counterOffer(user, offerId, dto);
    }
};
exports.MessagingController = MessagingController;
__decorate([
    (0, common_1.Post)('conversations'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, start_conversation_dto_1.StartConversationDto]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "startOrGet", null);
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('conversations/:conversationId/messages'),
    __param(0, (0, common_1.Param)('conversationId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('conversations/:conversationId/messages'),
    __param(0, (0, common_1.Param)('conversationId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('conversations/:conversationId/offers'),
    __param(0, (0, common_1.Param)('conversationId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, send_offer_dto_1.SendOfferDto]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "sendOffer", null);
__decorate([
    (0, common_1.Patch)('offers/:offerId/accept'),
    __param(0, (0, common_1.Param)('offerId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "acceptOffer", null);
__decorate([
    (0, common_1.Patch)('offers/:offerId/reject'),
    __param(0, (0, common_1.Param)('offerId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "rejectOffer", null);
__decorate([
    (0, common_1.Post)('offers/:offerId/counter'),
    __param(0, (0, common_1.Param)('offerId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, send_offer_dto_1.SendOfferDto]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "counterOffer", null);
exports.MessagingController = MessagingController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [messaging_service_1.MessagingService])
], MessagingController);
//# sourceMappingURL=messaging.controller.js.map