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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("./entities/payment.entity");
const unit_entity_1 = require("../units/entities/unit.entity");
const asset_transaction_entity_1 = require("../assets/entities/asset-transaction.entity");
let PaymentsService = class PaymentsService {
    constructor(paymentRepo, unitRepo, assetTransactionRepo, dataSource) {
        this.paymentRepo = paymentRepo;
        this.unitRepo = unitRepo;
        this.assetTransactionRepo = assetTransactionRepo;
        this.dataSource = dataSource;
    }
    async assertUnitOwnership(contractorId, unitId) {
        const unit = await this.unitRepo.findOne({
            where: { id: unitId },
            relations: ['block', 'block.project'],
        });
        if (!unit) {
            throw new common_1.NotFoundException('Daire bulunamadı');
        }
        if (unit.block.project.contractorId !== contractorId) {
            throw new common_1.ForbiddenException('Bu daireye erişim yetkiniz yok');
        }
        return unit;
    }
    async create(contractorId, unitId, dto, externalManager) {
        await this.assertUnitOwnership(contractorId, unitId);
        const run = async (manager) => {
            const payment = manager.create(payment_entity_1.Payment, {
                unitId,
                amount: dto.amount,
                paymentDate: new Date(dto.paymentDate),
                paymentMethod: dto.paymentMethod,
                note: dto.note,
            });
            const saved = await manager.save(payment);
            await manager.save(manager.create(asset_transaction_entity_1.AssetTransaction, {
                contractorId,
                transactionType: asset_transaction_entity_1.AssetTransactionType.UNIT_SALE_PAYMENT,
                amount: dto.amount,
                sourceTable: 'payments',
                sourceId: saved.id,
                transactionDate: new Date(dto.paymentDate),
            }));
            return saved;
        };
        return externalManager ? run(externalManager) : this.dataSource.transaction(run);
    }
    async findByUnit(contractorId, unitId) {
        await this.assertUnitOwnership(contractorId, unitId);
        return this.paymentRepo.find({
            where: { unitId },
            order: { paymentDate: 'ASC' },
        });
    }
    async getBalance(contractorId, unitId) {
        await this.assertUnitOwnership(contractorId, unitId);
        const rows = await this.dataSource.query('SELECT * FROM unit_payment_summary WHERE unit_id = $1', [unitId]);
        if (!rows.length) {
            throw new common_1.NotFoundException('Bu daire için bakiye bilgisi bulunamadı');
        }
        return rows[0];
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(unit_entity_1.Unit)),
    __param(2, (0, typeorm_1.InjectRepository)(asset_transaction_entity_1.AssetTransaction)),
    __param(3, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map