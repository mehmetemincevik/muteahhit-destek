import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message, MessageType } from './entities/message.entity';
import { Offer, OfferSenderRole, OfferStatus } from './entities/offer.entity';
import { CraftsmanProfile } from '../craftsmen/entities/craftsman-profile.entity';
import { Project } from '../projects/entities/project.entity';
import { StartConversationDto } from './dto/start-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { SendOfferDto } from './dto/send-offer.dto';
import { ProjectsService } from '../projects/projects.service';
import { CraftsmenService } from '../craftsmen/craftsmen.service';

type AuthUser = { userId: string; role: string };

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Conversation) private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
    @InjectRepository(Offer) private readonly offerRepo: Repository<Offer>,
    @InjectRepository(CraftsmanProfile)
    private readonly craftsmanProfileRepo: Repository<CraftsmanProfile>,
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    private readonly projectsService: ProjectsService,
    private readonly craftsmenService: CraftsmenService,
  ) {}

  // Konuşmanın tarafı olma kontrolü. Müteahhit tarafında contractorId, usta tarafında
  // craftsman.userId eşleşmesi aranır.
  private async assertParticipant(user: AuthUser, conversationId: string): Promise<Conversation> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: ['craftsman'],
    });
    if (!conversation) {
      throw new NotFoundException('Konuşma bulunamadı');
    }

    const isContractorParty = user.role === 'contractor' && conversation.contractorId === user.userId;
    const isCraftsmanParty =
      user.role === 'craftsman' && conversation.craftsman.userId === user.userId;

    if (!isContractorParty && !isCraftsmanParty) {
      throw new ForbiddenException('Bu konuşmaya erişim yetkiniz yok');
    }
    return conversation;
  }

  // Mevcut konuşma varsa döner, yoksa oluşturur. Var olan kayıt güncellenmez.
  async startOrGetConversation(user: AuthUser, dto: StartConversationDto): Promise<Conversation> {
    const existing = await this.conversationRepo.findOne({
      where: { projectId: dto.projectId, craftsmanId: dto.craftsmanId },
    });
    if (existing) {
      await this.assertParticipant(user, existing.id); // yine de bu kullanıcı gerçekten taraf mı kontrol et
      return existing;
    }

    // Yeni konuşma; doğrulama başlatan tarafın rolüne göre değişir.
    const project = await this.projectRepo.findOne({ where: { id: dto.projectId } });
    if (!project) {
      throw new NotFoundException('Proje bulunamadı');
    }

    if (user.role === 'contractor') {
      // Müteahhit yalnızca kendi projesinde konuşma açabilir.
      if (project.contractorId !== user.userId) {
        throw new ForbiddenException('Bu proje size ait değil');
      }
    } else {
      // Usta yalnızca kendi profili adına ve açık ilanı olan projelerde konuşma açabilir.
      // Kapalı projeler usta tarafından görülemediği için erişim de engellenir.
      const ownProfile = await this.craftsmanProfileRepo.findOne({ where: { userId: user.userId } });
      if (!ownProfile || ownProfile.id !== dto.craftsmanId) {
        throw new ForbiddenException('Sadece kendi profiliniz adına konuşma başlatabilirsiniz');
      }
      if (!project.isPublic) {
        throw new ForbiddenException('Bu proje açık (public) değil, konuşma başlatamazsınız');
      }
    }

    const conversation = this.conversationRepo.create({
      projectId: dto.projectId,
      craftsmanId: dto.craftsmanId,
      contractorId: project.contractorId,
    });
    return this.conversationRepo.save(conversation);
  }

  async findConversationsForUser(user: AuthUser): Promise<Conversation[]> {
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

  // Mesajlar.

  async getMessages(user: AuthUser, conversationId: string): Promise<Message[]> {
    await this.assertParticipant(user, conversationId);

    // Konuşma görüntülendiğinde karşı tarafın okunmamış mesajları okundu işaretlenir.
    await this.messageRepo
      .createQueryBuilder()
      .update(Message)
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

  async sendMessage(user: AuthUser, conversationId: string, dto: SendMessageDto): Promise<Message> {
    await this.assertParticipant(user, conversationId);

    const message = this.messageRepo.create({
      conversationId,
      senderId: user.userId,
      messageType: MessageType.TEXT,
      content: dto.content,
    });
    const saved = await this.messageRepo.save(message);

    await this.conversationRepo.update(conversationId, { lastMessageAt: new Date() });
    return saved;
  }

  // Teklifler. Her teklif, akışta görünmesi için bir mesaj kaydıyla birlikte oluşturulur.

  async sendOffer(user: AuthUser, conversationId: string, dto: SendOfferDto): Promise<Offer> {
    await this.assertParticipant(user, conversationId);

    const message = this.messageRepo.create({
      conversationId,
      senderId: user.userId,
      messageType: MessageType.OFFER,
    });
    const savedMessage = await this.messageRepo.save(message);

    const offer = this.offerRepo.create({
      messageId: savedMessage.id,
      conversationId,
      senderRole: user.role === 'contractor' ? OfferSenderRole.CONTRACTOR : OfferSenderRole.CRAFTSMAN,
      packageId: dto.packageId,
      amount: dto.amount,
      description: dto.description,
    });
    const savedOffer = await this.offerRepo.save(offer);

    await this.conversationRepo.update(conversationId, { lastMessageAt: new Date() });
    return savedOffer;
  }

  private async getOfferWithConversation(offerId: string): Promise<Offer> {
    const offer = await this.offerRepo.findOne({
      where: { id: offerId },
      relations: ['conversation', 'conversation.craftsman'],
    });
    if (!offer) {
      throw new NotFoundException('Teklif bulunamadı');
    }
    return offer;
  }

  // Teklifi yalnızca karşı taraf yanıtlayabilir.
  private assertNotOwnOffer(user: AuthUser, offer: Offer): void {
    const senderRoleMatches =
      (offer.senderRole === OfferSenderRole.CONTRACTOR && user.role === 'contractor') ||
      (offer.senderRole === OfferSenderRole.CRAFTSMAN && user.role === 'craftsman');
    if (senderRoleMatches) {
      throw new BadRequestException('Kendi gönderdiğiniz teklifi yanıtlayamazsınız');
    }
  }

  async acceptOffer(user: AuthUser, offerId: string): Promise<Offer> {
    const offer = await this.getOfferWithConversation(offerId);
    await this.assertParticipant(user, offer.conversationId);
    this.assertNotOwnOffer(user, offer);

    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException('Bu teklif zaten yanıtlanmış');
    }

    offer.status = OfferStatus.ACCEPTED;
    offer.respondedAt = new Date();
    const saved = await this.offerRepo.save(offer);

    // Kabul edilen teklif proje-usta ataması oluşturur. Atama, teklifi kim kabul ederse
    // etsin projenin müteahhidi adına açılır.
    await this.craftsmenService.createAssignment(
      offer.conversation.contractorId,
      offer.conversation.projectId,
      {
        craftsmanId: offer.conversation.craftsmanId,
        packageId: offer.packageId,
        agreedPrice: offer.amount,
      },
    );

    return saved;
  }

  async rejectOffer(user: AuthUser, offerId: string): Promise<Offer> {
    const offer = await this.getOfferWithConversation(offerId);
    await this.assertParticipant(user, offer.conversationId);
    this.assertNotOwnOffer(user, offer);

    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException('Bu teklif zaten yanıtlanmış');
    }

    offer.status = OfferStatus.REJECTED;
    offer.respondedAt = new Date();
    return this.offerRepo.save(offer);
  }

  async counterOffer(user: AuthUser, offerId: string, dto: SendOfferDto): Promise<Offer> {
    const originalOffer = await this.getOfferWithConversation(offerId);
    await this.assertParticipant(user, originalOffer.conversationId);
    this.assertNotOwnOffer(user, originalOffer);

    if (originalOffer.status !== OfferStatus.PENDING) {
      throw new BadRequestException('Bu teklif zaten yanıtlanmış');
    }

    // Karşılık verilen teklif kapatılır.
    originalOffer.status = OfferStatus.COUNTERED;
    originalOffer.respondedAt = new Date();
    await this.offerRepo.save(originalOffer);

    // Yeni teklif, countersOfferId ile öncekine bağlanır.
    const message = this.messageRepo.create({
      conversationId: originalOffer.conversationId,
      senderId: user.userId,
      messageType: MessageType.OFFER,
    });
    const savedMessage = await this.messageRepo.save(message);

    const counterOffer = this.offerRepo.create({
      messageId: savedMessage.id,
      conversationId: originalOffer.conversationId,
      senderRole: user.role === 'contractor' ? OfferSenderRole.CONTRACTOR : OfferSenderRole.CRAFTSMAN,
      packageId: dto.packageId,
      amount: dto.amount,
      description: dto.description,
      countersOfferId: originalOffer.id,
    });
    const saved = await this.offerRepo.save(counterOffer);

    await this.conversationRepo.update(originalOffer.conversationId, { lastMessageAt: new Date() });
    return saved;
  }
}
