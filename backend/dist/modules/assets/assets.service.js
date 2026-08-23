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
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const asset_entity_1 = require("./entities/asset.entity");
const asset_rental_entity_1 = require("./entities/asset-rental.entity");
const rental_payment_entity_1 = require("./entities/rental-payment.entity");
const asset_value_snapshot_entity_1 = require("./entities/asset-value-snapshot.entity");
const asset_transaction_entity_1 = require("./entities/asset-transaction.entity");
let AssetsService = class AssetsService {
    constructor(assetRepo, rentalRepo, rentalPaymentRepo, snapshotRepo, transactionRepo, dataSource) {
        this.assetRepo = assetRepo;
        this.rentalRepo = rentalRepo;
        this.rentalPaymentRepo = rentalPaymentRepo;
        this.snapshotRepo = snapshotRepo;
        this.transactionRepo = transactionRepo;
        this.dataSource = dataSource;
    }
    async assertAssetOwnership(contractorId, assetId) {
        const asset = await this.assetRepo.findOne({ where: { id: assetId } });
        if (!asset) {
            throw new common_1.NotFoundException('Varlık bulunamadı');
        }
        if (asset.contractorId !== contractorId) {
            throw new common_1.ForbiddenException('Bu varlığa erişim yetkiniz yok');
        }
        return asset;
    }
    async recomputeCashCommodityValue(assetId) {
        const rows = await this.dataSource.query('SELECT COALESCE(SUM(amount), 0) AS total FROM asset_transactions WHERE asset_id = $1', [assetId]);
        await this.assetRepo.update(assetId, {
            currentValue: parseFloat(rows[0].total),
            valueUpdatedAt: new Date(),
        });
    }
    async createAsset(contractorId, dto) {
        const asset = this.assetRepo.create({
            contractorId,
            assetType: dto.assetType,
            name: dto.name,
            description: dto.description,
            province: dto.province,
            district: dto.district,
            roomLayout: dto.roomLayout,
            areaM2: dto.areaM2,
        });
        return this.assetRepo.save(asset);
    }
    async findAssetsForContractor(contractorId) {
        return this.assetRepo.find({ where: { contractorId }, order: { createdAt: 'DESC' } });
    }
    async getAssetDetail(contractorId, assetId) {
        const asset = await this.assertAssetOwnership(contractorId, assetId);
        const transactions = await this.transactionRepo.find({
            where: { assetId },
            order: { transactionDate: 'DESC' },
        });
        const rentals = await this.rentalRepo.find({ where: { assetId } });
        const snapshots = await this.snapshotRepo.find({
            where: { assetId },
            order: { snapshotDate: 'DESC' },
        });
        return { asset, transactions, rentals, snapshots };
    }
    async addManualTransaction(contractorId, assetId, dto) {
        await this.assertAssetOwnership(contractorId, assetId);
        const signedAmount = dto.direction === 'manual_addition' ? dto.amount : -dto.amount;
        const transaction = this.transactionRepo.create({
            contractorId,
            assetId,
            transactionType: dto.direction === 'manual_addition'
                ? asset_transaction_entity_1.AssetTransactionType.MANUAL_ADDITION
                : asset_transaction_entity_1.AssetTransactionType.MANUAL_DEDUCTION,
            amount: signedAmount,
            transactionDate: new Date(dto.transactionDate),
            description: dto.description,
        });
        const saved = await this.transactionRepo.save(transaction);
        await this.recomputeCashCommodityValue(assetId);
        return saved;
    }
    async createRental(contractorId, assetId, dto) {
        const asset = await this.assertAssetOwnership(contractorId, assetId);
        if (asset.assetType !== asset_entity_1.AssetType.REAL_ESTATE) {
            throw new common_1.BadRequestException('Sadece real_estate tipi varlıklar kiraya verilebilir');
        }
        const rental = this.rentalRepo.create({
            assetId,
            tenantName: dto.tenantName,
            tenantPhone: dto.tenantPhone,
            monthlyRent: dto.monthlyRent,
            contractStartDate: dto.contractStartDate ? new Date(dto.contractStartDate) : undefined,
            contractEndDate: dto.contractEndDate ? new Date(dto.contractEndDate) : undefined,
        });
        const saved = await this.rentalRepo.save(rental);
        await this.assetRepo.update(assetId, { isGeneratingRentalIncome: true });
        return saved;
    }
    async assertRentalOwnership(contractorId, rentalId) {
        const rental = await this.rentalRepo.findOne({ where: { id: rentalId }, relations: ['asset'] });
        if (!rental) {
            throw new common_1.NotFoundException('Kira sözleşmesi bulunamadı');
        }
        if (rental.asset.contractorId !== contractorId) {
            throw new common_1.ForbiddenException('Bu kira sözleşmesine erişim yetkiniz yok');
        }
        return rental;
    }
    async addRentalPayment(contractorId, rentalId, dto) {
        const rental = await this.assertRentalOwnership(contractorId, rentalId);
        const payment = this.rentalPaymentRepo.create({
            rentalId,
            amount: dto.amount,
            paymentDate: new Date(dto.paymentDate),
            note: dto.note,
        });
        const saved = await this.rentalPaymentRepo.save(payment);
        await this.transactionRepo.save(this.transactionRepo.create({
            contractorId,
            assetId: rental.assetId,
            transactionType: asset_transaction_entity_1.AssetTransactionType.RENTAL_INCOME,
            amount: dto.amount,
            sourceTable: 'rental_payments',
            sourceId: saved.id,
            transactionDate: new Date(dto.paymentDate),
        }));
        return saved;
    }
    async addValueSnapshot(contractorId, assetId, dto) {
        const asset = await this.assertAssetOwnership(contractorId, assetId);
        if (asset.assetType !== asset_entity_1.AssetType.REAL_ESTATE) {
            throw new common_1.BadRequestException('Değer anlık görüntüsü sadece real_estate tipi varlıklar içindir');
        }
        const snapshot = this.snapshotRepo.create({
            assetId,
            estimatedValue: dto.estimatedValue,
            snapshotDate: new Date(dto.snapshotDate),
            source: dto.source,
        });
        const saved = await this.snapshotRepo.save(snapshot);
        await this.assetRepo.update(assetId, {
            currentValue: dto.estimatedValue,
            valueUpdatedAt: new Date(),
        });
        return saved;
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(asset_entity_1.Asset)),
    __param(1, (0, typeorm_1.InjectRepository)(asset_rental_entity_1.AssetRental)),
    __param(2, (0, typeorm_1.InjectRepository)(rental_payment_entity_1.RentalPayment)),
    __param(3, (0, typeorm_1.InjectRepository)(asset_value_snapshot_entity_1.AssetValueSnapshot)),
    __param(4, (0, typeorm_1.InjectRepository)(asset_transaction_entity_1.AssetTransaction)),
    __param(5, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], AssetsService);
//# sourceMappingURL=assets.service.js.map