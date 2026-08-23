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
exports.CraftsmenService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const craftsman_profile_entity_1 = require("./entities/craftsman-profile.entity");
const craftsman_service_package_entity_1 = require("./entities/craftsman-service-package.entity");
const service_package_item_entity_1 = require("./entities/service-package-item.entity");
const craftsman_portfolio_image_entity_1 = require("./entities/craftsman-portfolio-image.entity");
const craftsman_review_entity_1 = require("./entities/craftsman-review.entity");
const project_craftsman_assignment_entity_1 = require("./entities/project-craftsman-assignment.entity");
const projects_service_1 = require("../projects/projects.service");
let CraftsmenService = class CraftsmenService {
    constructor(profileRepo, packageRepo, packageItemRepo, portfolioRepo, reviewRepo, assignmentRepo, dataSource, projectsService) {
        this.profileRepo = profileRepo;
        this.packageRepo = packageRepo;
        this.packageItemRepo = packageItemRepo;
        this.portfolioRepo = portfolioRepo;
        this.reviewRepo = reviewRepo;
        this.assignmentRepo = assignmentRepo;
        this.dataSource = dataSource;
        this.projectsService = projectsService;
    }
    async upsertProfile(userId, dto) {
        let profile = await this.profileRepo.findOne({ where: { userId } });
        if (profile) {
            Object.assign(profile, dto);
        }
        else {
            profile = this.profileRepo.create({ userId, ...dto });
        }
        return this.profileRepo.save(profile);
    }
    async getMyProfile(userId) {
        const profile = await this.profileRepo.findOne({ where: { userId } });
        if (!profile) {
            throw new common_1.NotFoundException('Henüz bir usta profili oluşturmadınız');
        }
        return profile;
    }
    async findAllProfiles(filters) {
        const query = this.profileRepo.createQueryBuilder('profile');
        if (filters?.province) {
            query.andWhere('profile.province = :province', { province: filters.province });
        }
        if (filters?.district) {
            query.andWhere('profile.district = :district', { district: filters.district });
        }
        return query.orderBy('profile.averageRating', 'DESC').getMany();
    }
    async getProfileDetail(craftsmanId) {
        const profile = await this.profileRepo.findOne({ where: { id: craftsmanId } });
        if (!profile) {
            throw new common_1.NotFoundException('Usta bulunamadı');
        }
        const packages = await this.packageRepo.find({
            where: { craftsmanId, isActive: true },
            relations: ['items'],
        });
        const portfolioImages = await this.portfolioRepo.find({ where: { craftsmanId } });
        const reviews = await this.reviewRepo.find({
            where: { craftsmanId },
            order: { createdAt: 'DESC' },
        });
        return { profile, packages, portfolioImages, reviews };
    }
    async getOwnCraftsmanId(userId) {
        const profile = await this.profileRepo.findOne({ where: { userId } });
        if (!profile) {
            throw new common_1.BadRequestException('Önce bir usta profili oluşturmalısınız');
        }
        return profile.id;
    }
    async createPackage(userId, dto) {
        const craftsmanId = await this.getOwnCraftsmanId(userId);
        const pkg = this.packageRepo.create({ craftsmanId, ...dto });
        return this.packageRepo.save(pkg);
    }
    async assertPackageOwnership(userId, packageId) {
        const pkg = await this.packageRepo.findOne({ where: { id: packageId }, relations: ['craftsman'] });
        if (!pkg) {
            throw new common_1.NotFoundException('Hizmet paketi bulunamadı');
        }
        if (pkg.craftsman.userId !== userId) {
            throw new common_1.ForbiddenException('Bu pakete erişim yetkiniz yok');
        }
        return pkg;
    }
    async addPackageItem(userId, packageId, dto) {
        await this.assertPackageOwnership(userId, packageId);
        const item = this.packageItemRepo.create({ packageId, ...dto });
        return this.packageItemRepo.save(item);
    }
    async addPortfolioImage(userId, dto) {
        const craftsmanId = await this.getOwnCraftsmanId(userId);
        const image = this.portfolioRepo.create({ craftsmanId, ...dto });
        return this.portfolioRepo.save(image);
    }
    async createReview(contractorId, dto) {
        if (dto.projectId) {
            const assignment = await this.assignmentRepo.findOne({
                where: { projectId: dto.projectId, craftsmanId: dto.craftsmanId },
                relations: ['project'],
            });
            if (!assignment || assignment.project.contractorId !== contractorId) {
                throw new common_1.BadRequestException('Bu usta, belirtilen projede sizinle çalışmamış görünüyor');
            }
        }
        const review = this.reviewRepo.create({ contractorId, ...dto });
        const saved = await this.reviewRepo.save(review);
        await this.recomputeRating(dto.craftsmanId);
        return saved;
    }
    async recomputeRating(craftsmanId) {
        const rows = await this.dataSource.query('SELECT AVG(rating) as avg, COUNT(*) as count FROM craftsman_reviews WHERE craftsman_id = $1', [craftsmanId]);
        await this.profileRepo.update(craftsmanId, {
            averageRating: rows[0].avg ? parseFloat(rows[0].avg) : 0,
            reviewCount: parseInt(rows[0].count, 10),
        });
    }
    async createAssignment(contractorId, projectId, dto) {
        await this.projectsService.findOneForContractor(projectId, contractorId);
        const assignment = this.assignmentRepo.create({
            projectId,
            craftsmanId: dto.craftsmanId,
            packageId: dto.packageId,
            agreedPrice: dto.agreedPrice,
            startDate: dto.startDate ? new Date(dto.startDate) : undefined,
            notes: dto.notes,
        });
        return this.assignmentRepo.save(assignment);
    }
    async findAssignmentsByProject(contractorId, projectId) {
        await this.projectsService.findOneForContractor(projectId, contractorId);
        return this.assignmentRepo.find({
            where: { projectId },
            relations: ['craftsman'],
        });
    }
    async findAssignmentsForCraftsman(userId) {
        const craftsmanId = await this.getOwnCraftsmanId(userId);
        return this.assignmentRepo.find({
            where: { craftsmanId },
            relations: ['project'],
            order: { createdAt: 'DESC' },
        });
    }
    async updateAssignmentStatus(contractorId, assignmentId, dto) {
        const assignment = await this.assignmentRepo.findOne({
            where: { id: assignmentId },
            relations: ['project'],
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Atama bulunamadı');
        }
        if (assignment.project.contractorId !== contractorId) {
            throw new common_1.ForbiddenException('Bu atamaya erişim yetkiniz yok');
        }
        assignment.status = dto.status;
        if (dto.endDate) {
            assignment.endDate = new Date(dto.endDate);
        }
        return this.assignmentRepo.save(assignment);
    }
};
exports.CraftsmenService = CraftsmenService;
exports.CraftsmenService = CraftsmenService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(craftsman_profile_entity_1.CraftsmanProfile)),
    __param(1, (0, typeorm_1.InjectRepository)(craftsman_service_package_entity_1.CraftsmanServicePackage)),
    __param(2, (0, typeorm_1.InjectRepository)(service_package_item_entity_1.ServicePackageItem)),
    __param(3, (0, typeorm_1.InjectRepository)(craftsman_portfolio_image_entity_1.CraftsmanPortfolioImage)),
    __param(4, (0, typeorm_1.InjectRepository)(craftsman_review_entity_1.CraftsmanReview)),
    __param(5, (0, typeorm_1.InjectRepository)(project_craftsman_assignment_entity_1.ProjectCraftsmanAssignment)),
    __param(6, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        projects_service_1.ProjectsService])
], CraftsmenService);
//# sourceMappingURL=craftsmen.service.js.map