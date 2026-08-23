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
exports.MessagingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversation_entity_1 = require("./entities/conversation.entity");
const message_entity_1 = require("./entities/message.entity");
const offer_entity_1 = require("./entities/offer.entity");
const craftsman_profile_entity_1 = require("../craftsmen/entities/craftsman-profile.entity");
const project_entity_1 = require("../projects/entities/project.entity");
const projects_service_1 = require("../projects/projects.service");
const craftsmen_service_1 = require("../craftsmen/craftsmen.service");
let MessagingService = class MessagingService {
    constructor(conversationRepo, messageRepo, offerRepo, craftsmanProfileRepo, projectRepo, projectsService, craftsmenService) {
        this.conversationRepo = conversationRepo;
        this.messageRepo = messageRepo;
        this.offerRepo = offerRepo;
        this.craftsmanProfileRepo = craftsmanProfileRepo;
        this.projectRepo = projectRepo;
        this.projectsService = projectsService;
        this.craftsmenService = craftsmenService;
    }
    async assertParticipant(user, conversationId) {
        const conversation = await this.conversationRepo.findOne({
            where: { id: conversationId },
            relations: ['craftsman'],
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Konuşma bulunamadı');
        }
        const isContractorParty = user.role === 'contractor' && conversation.contractorId === user.userId;
        const isCraftsmanParty = user.role === 'craftsman' && conversation.craftsman.userId === user.userId;
        if (!isContractorParty && !isCraftsmanParty) {
            throw new common_1.ForbiddenException('Bu konuşmaya erişim yetkiniz yok');
        }
        return conversation;
    }
    async startOrGetConversation(user, dto) {
        const existing = await this.conversationRepo.findOne({
            where: { projectId: dto.projectId, craftsmanId: dto.craftsmanId },
        });
        if (existing) {
            await this.assertParticipant(user, existing.id);
            return existing;
        }
        const project = await this.projectRepo.findOne({ where: { id: dto.projectId } });
        if (!project) {
            throw new common_1.NotFoundException('Proje bulunamadı');
        }
        if (user.role === 'contractor') {
            if (project.contractorId !== user.userId) {
                throw new common_1.ForbiddenException('Bu proje size ait değil');
            }
        }
        else {
            const ownProfile = await this.craftsmanProfileRepo.findOne({ where: { userId: user.userId } });
            if (!ownProfile || ownProfile.id !== dto.craftsmanId) {
                throw new common_1.ForbiddenException('Sadece kendi profiliniz adına konuşma başlatabilirsiniz');
            }
            if (!project.isPublic) {
                throw new common_1.ForbiddenException('Bu proje açık (public) değil, konuşma başlatamazsınız');
            }
        }
        const conversation = this.conversationRepo.create({
            projectId: dto.projectId,
            craftsmanId: dto.craftsmanId,
            contractorId: project.contractorId,
        });
        return this.conversationRepo.save(conversation);
    }
    async findConversationsForUser(user) {
        if (user.role === 'contractor') {
            return this.conversationRepo.find({
                where: { contractorId: user.userId },
                order: { lastMessageAt: 'DESC' },
            });
        }
        const ownProfile = await this.craftsmanProfileRepo.findOne({ where: { userId: user.userId } });
        if (!ownProfile) {
            return [];
        }
        return this.conversationRepo.find({
            where: { craftsmanId: ownProfile.id },
            order: { lastMessageAt: 'DESC' },
        });
    }
    async getMessages(user, conversationId) {
        await this.assertParticipant(user, conversationId);
        await this.messageRepo
            .createQueryBuilder()
            .update(message_entity_1.Message)
            .set({ readAt: () => 'now()' })
            .where('conversation_id = :conversationId', { conversationId })
            .andWhere('sender_id != :userId', { userId: user.userId })
            .andWhere('read_at IS NULL')
            .execute();
        return this.messageRepo.find({
            where: { conversationId },
            order: { createdAt: 'ASC' },
        });
    }
    async sendMessage(user, conversationId, dto) {
        await this.assertParticipant(user, conversationId);
        const message = this.messageRepo.create({
            conversationId,
            senderId: user.userId,
            messageType: message_entity_1.MessageType.TEXT,
            content: dto.content,
        });
        const saved = await this.messageRepo.save(message);
        await this.conversationRepo.update(conversationId, { lastMessageAt: new Date() });
        return saved;
    }
    async sendOffer(user, conversationId, dto) {
        await this.assertParticipant(user, conversationId);
        const message = this.messageRepo.create({
            conversationId,
            senderId: user.userId,
            messageType: message_entity_1.MessageType.OFFER,
        });
        const savedMessage = await this.messageRepo.save(message);
        const offer = this.offerRepo.create({
            messageId: savedMessage.id,
            conversationId,
            senderRole: user.role === 'contractor' ? offer_entity_1.OfferSenderRole.CONTRACTOR : offer_entity_1.OfferSenderRole.CRAFTSMAN,
            packageId: dto.packageId,
            amount: dto.amount,
            description: dto.description,
        });
        const savedOffer = await this.offerRepo.save(offer);
        await this.conversationRepo.update(conversationId, { lastMessageAt: new Date() });
        return savedOffer;
    }
    async getOfferWithConversation(offerId) {
        const offer = await this.offerRepo.findOne({
            where: { id: offerId },
            relations: ['conversation', 'conversation.craftsman'],
        });
        if (!offer) {
            throw new common_1.NotFoundException('Teklif bulunamadı');
        }
        return offer;
    }
    assertNotOwnOffer(user, offer) {
        const senderRoleMatches = (offer.senderRole === offer_entity_1.OfferSenderRole.CONTRACTOR && user.role === 'contractor') ||
            (offer.senderRole === offer_entity_1.OfferSenderRole.CRAFTSMAN && user.role === 'craftsman');
        if (senderRoleMatches) {
            throw new common_1.BadRequestException('Kendi gönderdiğiniz teklifi yanıtlayamazsınız');
        }
    }
    async acceptOffer(user, offerId) {
        const offer = await this.getOfferWithConversation(offerId);
        await this.assertParticipant(user, offer.conversationId);
        this.assertNotOwnOffer(user, offer);
        if (offer.status !== offer_entity_1.OfferStatus.PENDING) {
            throw new common_1.BadRequestException('Bu teklif zaten yanıtlanmış');
        }
        offer.status = offer_entity_1.OfferStatus.ACCEPTED;
        offer.respondedAt = new Date();
        const saved = await this.offerRepo.save(offer);
        await this.craftsmenService.createAssignment(offer.conversation.contractorId, offer.conversation.projectId, {
            craftsmanId: offer.conversation.craftsmanId,
            packageId: offer.packageId,
            agreedPrice: offer.amount,
        });
        return saved;
    }
    async rejectOffer(user, offerId) {
        const offer = await this.getOfferWithConversation(offerId);
        await this.assertParticipant(user, offer.conversationId);
        this.assertNotOwnOffer(user, offer);
        if (offer.status !== offer_entity_1.OfferStatus.PENDING) {
            throw new common_1.BadRequestException('Bu teklif zaten yanıtlanmış');
        }
        offer.status = offer_entity_1.OfferStatus.REJECTED;
        offer.respondedAt = new Date();
        return this.offerRepo.save(offer);
    }
    async counterOffer(user, offerId, dto) {
        const originalOffer = await this.getOfferWithConversation(offerId);
        await this.assertParticipant(user, originalOffer.conversationId);
        this.assertNotOwnOffer(user, originalOffer);
        if (originalOffer.status !== offer_entity_1.OfferStatus.PENDING) {
            throw new common_1.BadRequestException('Bu teklif zaten yanıtlanmış');
        }
        originalOffer.status = offer_entity_1.OfferStatus.COUNTERED;
        originalOffer.respondedAt = new Date();
        await this.offerRepo.save(originalOffer);
        const message = this.messageRepo.create({
            conversationId: originalOffer.conversationId,
            senderId: user.userId,
            messageType: message_entity_1.MessageType.OFFER,
        });
        const savedMessage = await this.messageRepo.save(message);
        const counterOffer = this.offerRepo.create({
            messageId: savedMessage.id,
            conversationId: originalOffer.conversationId,
            senderRole: user.role === 'contractor' ? offer_entity_1.OfferSenderRole.CONTRACTOR : offer_entity_1.OfferSenderRole.CRAFTSMAN,
            packageId: dto.packageId,
            amount: dto.amount,
            description: dto.description,
            countersOfferId: originalOffer.id,
        });
        const saved = await this.offerRepo.save(counterOffer);
        await this.conversationRepo.update(originalOffer.conversationId, { lastMessageAt: new Date() });
        return saved;
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(2, (0, typeorm_1.InjectRepository)(offer_entity_1.Offer)),
    __param(3, (0, typeorm_1.InjectRepository)(craftsman_profile_entity_1.CraftsmanProfile)),
    __param(4, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        projects_service_1.ProjectsService,
        craftsmen_service_1.CraftsmenService])
], MessagingService);
//# sourceMappingURL=messaging.service.js.map