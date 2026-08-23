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
exports.CostsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cost_category_entity_1 = require("./entities/cost-category.entity");
const cost_item_entity_1 = require("./entities/cost-item.entity");
const cost_payment_entity_1 = require("./entities/cost-payment.entity");
const asset_transaction_entity_1 = require("../assets/entities/asset-transaction.entity");
const projects_service_1 = require("../projects/projects.service");
let CostsService = class CostsService {
    constructor(categoryRepo, costItemRepo, costPaymentRepo, assetTransactionRepo, dataSource, projectsService) {
        this.categoryRepo = categoryRepo;
        this.costItemRepo = costItemRepo;
        this.costPaymentRepo = costPaymentRepo;
        this.assetTransactionRepo = assetTransactionRepo;
        this.dataSource = dataSource;
        this.projectsService = projectsService;
    }
    async createCategory(dto) {
        const category = this.categoryRepo.create(dto);
        return this.categoryRepo.save(category);
    }
    async findCategories() {
        return this.categoryRepo.find({ order: { name: 'ASC' } });
    }
    async createCostItem(contractorId, projectId, dto) {
        await this.projectsService.findOneForContractor(projectId, contractorId);
        const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
        if (!category) {
            throw new common_1.NotFoundException('Maliyet kategorisi bulunamadı');
        }
        const costItem = this.costItemRepo.create({
            projectId,
            categoryId: dto.categoryId,
            name: dto.name,
            quantity: dto.quantity,
            unit: dto.unit,
            unitPrice: dto.unitPrice,
            totalCost: dto.totalCost,
            source: dto.source,
            extraSpecs: dto.extraSpecs,
            incurredDate: dto.incurredDate ? new Date(dto.incurredDate) : undefined,
        });
        return this.costItemRepo.save(costItem);
    }
    async findCostItemsByProject(contractorId, projectId) {
        await this.projectsService.findOneForContractor(projectId, contractorId);
        return this.costItemRepo.find({
            where: { projectId },
            relations: ['category'],
            order: { createdAt: 'DESC' },
        });
    }
    async getProjectCostSummary(contractorId, projectId) {
        await this.projectsService.findOneForContractor(projectId, contractorId);
        return this.dataSource.query('SELECT * FROM project_cost_summary WHERE project_id = $1 ORDER BY cost_type, category_name', [projectId]);
    }
    async assertCostItemOwnership(contractorId, costItemId) {
        const costItem = await this.costItemRepo.findOne({
            where: { id: costItemId },
            relations: ['project'],
        });
        if (!costItem) {
            throw new common_1.NotFoundException('Maliyet kalemi bulunamadı');
        }
        if (costItem.project.contractorId !== contractorId) {
            throw new common_1.ForbiddenException('Bu maliyet kalemine erişim yetkiniz yok');
        }
        return costItem;
    }
    async createCostPayment(contractorId, costItemId, dto) {
        await this.assertCostItemOwnership(contractorId, costItemId);
        const payment = this.costPaymentRepo.create({
            costItemId,
            amount: dto.amount,
            paymentDate: new Date(dto.paymentDate),
            paymentMethod: dto.paymentMethod,
            note: dto.note,
        });
        const saved = await this.costPaymentRepo.save(payment);
        await this.assetTransactionRepo.save(this.assetTransactionRepo.create({
            contractorId,
            transactionType: asset_transaction_entity_1.AssetTransactionType.COST_PAYMENT,
            amount: -dto.amount,
            sourceTable: 'cost_payments',
            sourceId: saved.id,
            transactionDate: new Date(dto.paymentDate),
        }));
        return saved;
    }
    async getCostItemBalance(contractorId, costItemId) {
        await this.assertCostItemOwnership(contractorId, costItemId);
        const rows = await this.dataSource.query('SELECT * FROM cost_item_payment_summary WHERE cost_item_id = $1', [costItemId]);
        if (!rows.length) {
            throw new common_1.NotFoundException('Bu maliyet kalemi için bakiye bilgisi bulunamadı');
        }
        return rows[0];
    }
};
exports.CostsService = CostsService;
exports.CostsService = CostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cost_category_entity_1.CostCategory)),
    __param(1, (0, typeorm_1.InjectRepository)(cost_item_entity_1.CostItem)),
    __param(2, (0, typeorm_1.InjectRepository)(cost_payment_entity_1.CostPayment)),
    __param(3, (0, typeorm_1.InjectRepository)(asset_transaction_entity_1.AssetTransaction)),
    __param(4, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        projects_service_1.ProjectsService])
], CostsService);
//# sourceMappingURL=costs.service.js.map