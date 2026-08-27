import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './entities/block.entity';
import { Unit, UnitOwnershipStatus } from './entities/unit.entity';
import { Buyer } from './entities/buyer.entity';
import { CreateBlockDto } from './dto/create-block.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateUnitStatusDto } from './dto/update-unit-status.dto';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Block) private readonly blockRepo: Repository<Block>,
    @InjectRepository(Unit) private readonly unitRepo: Repository<Unit>,
    @InjectRepository(Buyer) private readonly buyerRepo: Repository<Buyer>,
    private readonly projectsService: ProjectsService,
  ) {}

  // --- Alıcılar ---

  async createBuyer(contractorId: string, dto: CreateBuyerDto): Promise<Buyer> {
    const buyer = this.buyerRepo.create({ contractorId, ...dto });
    return this.buyerRepo.save(buyer);
  }

  // Sadece giriş yapan müteahhidin KENDİ alıcıları -- başkasınınkiler görünmez
  async findBuyers(contractorId: string): Promise<Buyer[]> {
    return this.buyerRepo.find({
      where: { contractorId },
      order: { createdAt: 'DESC' },
    });
  }

  async createBlock(contractorId: string, projectId: string, dto: CreateBlockDto): Promise<Block> {
    // Bu projenin gerçekten bu müteahhide ait olduğunu doğrular (yoksa NotFound/Forbidden fırlatır)
    await this.projectsService.findOneForContractor(projectId, contractorId);

    const block = this.blockRepo.create({ projectId, name: dto.name, floorCount: dto.floorCount });
    return this.blockRepo.save(block);
  }

  async createUnit(contractorId: string, blockId: string, dto: CreateUnitDto): Promise<Unit> {
    const block = await this.blockRepo.findOne({ where: { id: blockId }, relations: ['project'] });
    if (!block) {
      throw new NotFoundException('Blok bulunamadı');
    }
    if (block.project.contractorId !== contractorId) {
      throw new ForbiddenException('Bu bloğa erişim yetkiniz yok');
    }

    const unit = this.unitRepo.create({
      blockId,
      floorNo: dto.floorNo,
      unitNo: dto.unitNo,
      roomLayout: dto.roomLayout,
      grossM2: dto.grossM2,
      netM2: dto.netM2,
      salePrice: dto.salePrice,
    });
    return this.unitRepo.save(unit);
  }

  // Durum güncelleme: SQL'deki CHECK constraint ile aynı kuralı burada da uyguluyoruz.
  // Neden ikisi de var? Veritabanı son savunma hattı (asla bozuk veri girmesin), ama kullanıcıya
  // "constraint violation" gibi teknik bir hata yerine anlamlı bir mesaj göstermek için
  // servis katmanında da aynı kontrolü baştan yapıyoruz.
  async updateStatus(
    contractorId: string,
    unitId: string,
    dto: UpdateUnitStatusDto,
  ): Promise<Unit> {
    const unit = await this.unitRepo.findOne({ where: { id: unitId }, relations: ['block', 'block.project'] });
    if (!unit) {
      throw new NotFoundException('Daire bulunamadı');
    }
    if (unit.block.project.contractorId !== contractorId) {
      throw new ForbiddenException('Bu daireye erişim yetkiniz yok');
    }

    if (dto.status === UnitOwnershipStatus.SOLD && !dto.buyerId) {
      throw new BadRequestException('Satıldı durumunda buyerId zorunludur');
    }
    if (dto.status === UnitOwnershipStatus.GIVEN_TO_LAND_OWNER && !dto.landOwnerId) {
      throw new BadRequestException('Arsa sahibine verildi durumunda landOwnerId zorunludur');
    }

    // GÜVENLİK: verilen alıcının gerçekten BU müteahhide ait olduğunu doğrula.
    // Bu kontrol olmasa, bir müteahhit başka birinin alıcı ID'sini kendi dairesine
    // bağlayabilirdi (ID'yi bir şekilde ele geçirirse).
    if (dto.buyerId) {
      const buyer = await this.buyerRepo.findOne({ where: { id: dto.buyerId } });
      if (!buyer || buyer.contractorId !== contractorId) {
        throw new ForbiddenException('Bu alıcı kaydına erişim yetkiniz yok');
      }
    }

    unit.ownershipStatus = dto.status;
    unit.buyerId = dto.status === UnitOwnershipStatus.SOLD ? dto.buyerId : undefined;
    unit.landOwnerId =
      dto.status === UnitOwnershipStatus.GIVEN_TO_LAND_OWNER ? dto.landOwnerId : undefined;

    return this.unitRepo.save(unit);
  }

  async findByProject(contractorId: string, projectId: string): Promise<Block[]> {
    await this.projectsService.findOneForContractor(projectId, contractorId);
    return this.blockRepo.find({ where: { projectId }, relations: ['units'] });
  }
}
