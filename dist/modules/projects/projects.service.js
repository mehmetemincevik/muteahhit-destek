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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("./entities/project.entity");
const land_entity_1 = require("./entities/land.entity");
const land_owner_entity_1 = require("./entities/land-owner.entity");
let ProjectsService = class ProjectsService {
    constructor(projectRepo, dataSource) {
        this.projectRepo = projectRepo;
        this.dataSource = dataSource;
    }
    async create(contractorId, dto) {
        return this.dataSource.transaction(async (manager) => {
            const project = manager.create(project_entity_1.Project, {
                contractorId,
                name: dto.name,
                estimatedOccupancyDate: dto.estimatedOccupancyDate
                    ? new Date(dto.estimatedOccupancyDate)
                    : undefined,
            });
            await manager.save(project);
            const hasLandInfo = dto.province || dto.district || dto.areaM2 || dto.purchasePrice || dto.adaNo;
            if (hasLandInfo) {
                const land = manager.create(land_entity_1.Land, {
                    projectId: project.id,
                    province: dto.province,
                    district: dto.district,
                    neighborhood: dto.neighborhood,
                    adaNo: dto.adaNo,
                    parselNo: dto.parselNo,
                    areaM2: dto.areaM2,
                    purchasePrice: dto.purchasePrice,
                    isKatKarsiligi: dto.isKatKarsiligi ?? false,
                });
                await manager.save(land);
                if (dto.owners?.length) {
                    const owners = dto.owners.map((o) => manager.create(land_owner_entity_1.LandOwner, {
                        landId: land.id,
                        fullName: o.fullName,
                        phone: o.phone,
                        sharePercentage: o.sharePercentage,
                        tcOrVkn: o.tcOrVkn,
                    }));
                    await manager.save(owners);
                }
            }
            return project;
        });
    }
    async findAllForContractor(contractorId) {
        return this.projectRepo.find({
            where: { contractorId },
            order: { createdAt: 'DESC' },
        });
    }
    async findOneForContractor(id, contractorId) {
        const project = await this.projectRepo.findOne({
            where: { id },
            relations: ['blocks', 'blocks.units'],
        });
        if (!project) {
            throw new common_1.NotFoundException('Proje bulunamadı');
        }
        if (project.contractorId !== contractorId) {
            throw new common_1.ForbiddenException('Bu projeye erişim yetkiniz yok');
        }
        return project;
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map