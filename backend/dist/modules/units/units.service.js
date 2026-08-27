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
exports.UnitsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const block_entity_1 = require("./entities/block.entity");
const unit_entity_1 = require("./entities/unit.entity");
const buyer_entity_1 = require("./entities/buyer.entity");
const projects_service_1 = require("../projects/projects.service");
let UnitsService = class UnitsService {
    constructor(blockRepo, unitRepo, buyerRepo, projectsService) {
        this.blockRepo = blockRepo;
        this.unitRepo = unitRepo;
        this.buyerRepo = buyerRepo;
        this.projectsService = projectsService;
    }
    async createBuyer(contractorId, dto) {
        const buyer = this.buyerRepo.create({ contractorId, ...dto });
        return this.buyerRepo.save(buyer);
    }
    async findBuyers(contractorId) {
        return this.buyerRepo.find({
            where: { contractorId },
            order: { createdAt: 'DESC' },
        });
    }
    async createBlock(contractorId, projectId, dto) {
        await this.projectsService.findOneForContractor(projectId, contractorId);
        const block = this.blockRepo.create({ projectId, name: dto.name, floorCount: dto.floorCount });
        return this.blockRepo.save(block);
    }
    async createUnit(contractorId, blockId, dto) {
        const block = await this.blockRepo.findOne({ where: { id: blockId }, relations: ['project'] });
        if (!block) {
            throw new common_1.NotFoundException('Blok bulunamadı');
        }
        if (block.project.contractorId !== contractorId) {
            throw new common_1.ForbiddenException('Bu bloğa erişim yetkiniz yok');
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
    async updateStatus(contractorId, unitId, dto) {
        const unit = await this.unitRepo.findOne({ where: { id: unitId }, relations: ['block', 'block.project'] });
        if (!unit) {
            throw new common_1.NotFoundException('Daire bulunamadı');
        }
        if (unit.block.project.contractorId !== contractorId) {
            throw new common_1.ForbiddenException('Bu daireye erişim yetkiniz yok');
        }
        if (dto.status === unit_entity_1.UnitOwnershipStatus.SOLD && !dto.buyerId) {
            throw new common_1.BadRequestException('Satıldı durumunda buyerId zorunludur');
        }
        if (dto.status === unit_entity_1.UnitOwnershipStatus.GIVEN_TO_LAND_OWNER && !dto.landOwnerId) {
            throw new common_1.BadRequestException('Arsa sahibine verildi durumunda landOwnerId zorunludur');
        }
        if (dto.buyerId) {
            const buyer = await this.buyerRepo.findOne({ where: { id: dto.buyerId } });
            if (!buyer || buyer.contractorId !== contractorId) {
                throw new common_1.ForbiddenException('Bu alıcı kaydına erişim yetkiniz yok');
            }
        }
        unit.ownershipStatus = dto.status;
        unit.buyerId = dto.status === unit_entity_1.UnitOwnershipStatus.SOLD ? dto.buyerId : undefined;
        unit.landOwnerId =
            dto.status === unit_entity_1.UnitOwnershipStatus.GIVEN_TO_LAND_OWNER ? dto.landOwnerId : undefined;
        return this.unitRepo.save(unit);
    }
    async findByProject(contractorId, projectId) {
        await this.projectsService.findOneForContractor(projectId, contractorId);
        return this.blockRepo.find({ where: { projectId }, relations: ['units'] });
    }
};
exports.UnitsService = UnitsService;
exports.UnitsService = UnitsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(block_entity_1.Block)),
    __param(1, (0, typeorm_1.InjectRepository)(unit_entity_1.Unit)),
    __param(2, (0, typeorm_1.InjectRepository)(buyer_entity_1.Buyer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        projects_service_1.ProjectsService])
], UnitsService);
//# sourceMappingURL=units.service.js.map