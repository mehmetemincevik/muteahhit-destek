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
var CashflowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashflowService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cashflow_calendar_entity_1 = require("./entities/cashflow-calendar.entity");
const cashflow_interest_accrual_entity_1 = require("./entities/cashflow-interest-accrual.entity");
const asset_transaction_entity_1 = require("../assets/entities/asset-transaction.entity");
const payments_service_1 = require("../payments/payments.service");
const assets_service_1 = require("../assets/assets.service");
let CashflowService = CashflowService_1 = class CashflowService {
    constructor(calendarRepo, accrualRepo, assetTransactionRepo, dataSource, paymentsService, assetsService) {
        this.calendarRepo = calendarRepo;
        this.accrualRepo = accrualRepo;
        this.assetTransactionRepo = assetTransactionRepo;
        this.dataSource = dataSource;
        this.paymentsService = paymentsService;
        this.assetsService = assetsService;
        this.logger = new common_1.Logger(CashflowService_1.name);
    }
    async create(contractorId, dto) {
        let sourceTable;
        let sourceId;
        if (dto.unitId) {
            sourceTable = 'units';
            sourceId = dto.unitId;
        }
        else if (dto.rentalId) {
            sourceTable = 'asset_rentals';
            sourceId = dto.rentalId;
        }
        const entry = this.calendarRepo.create({
            contractorId,
            entryType: dto.entryType,
            direction: dto.direction,
            title: dto.title,
            originalAmount: dto.originalAmount,
            currentAmount: dto.originalAmount,
            dueDate: new Date(dto.dueDate),
            dailyInterestRate: dto.dailyInterestRate,
            sourceTable,
            sourceId,
            notes: dto.notes,
        });
        return this.calendarRepo.save(entry);
    }
    async findAllForContractor(contractorId) {
        return this.calendarRepo.find({
            where: { contractorId },
            order: { dueDate: 'ASC' },
        });
    }
    async assertEntryOwnership(contractorId, entryId) {
        const entry = await this.calendarRepo.findOne({ where: { id: entryId } });
        if (!entry) {
            throw new common_1.NotFoundException('Takvim kaydı bulunamadı');
        }
        if (entry.contractorId !== contractorId) {
            throw new common_1.ForbiddenException('Bu takvim kaydına erişim yetkiniz yok');
        }
        return entry;
    }
    async getEntryDetail(contractorId, entryId) {
        const entry = await this.assertEntryOwnership(contractorId, entryId);
        const accruals = await this.accrualRepo.find({
            where: { calendarEntryId: entryId },
            order: { accrualDate: 'ASC' },
        });
        return { entry, accruals };
    }
    async markAsPaid(contractorId, entryId, dto) {
        const entry = await this.assertEntryOwnership(contractorId, entryId);
        if (entry.status === cashflow_calendar_entity_1.CashflowStatus.PAID) {
            throw new common_1.BadRequestException('Bu kayıt zaten ödendi olarak işaretlenmiş');
        }
        switch (entry.entryType) {
            case cashflow_calendar_entity_1.CashflowEntryType.INSTALLMENT_PAYMENT: {
                if (!entry.sourceId) {
                    throw new common_1.BadRequestException('Bu kayıt oluşturulurken unitId belirtilmemiş, hangi daireye ait olduğu bilinmiyor');
                }
                await this.paymentsService.create(contractorId, entry.sourceId, {
                    amount: entry.currentAmount,
                    paymentDate: dto.paidDate,
                    paymentMethod: dto.paymentMethod,
                    note: `Takvim kaydından: ${entry.title}`,
                });
                break;
            }
            case cashflow_calendar_entity_1.CashflowEntryType.RENT: {
                if (!entry.sourceId) {
                    throw new common_1.BadRequestException('Bu kayıt oluşturulurken rentalId belirtilmemiş, hangi kira sözleşmesine ait olduğu bilinmiyor');
                }
                await this.assetsService.addRentalPayment(contractorId, entry.sourceId, {
                    amount: entry.currentAmount,
                    paymentDate: dto.paidDate,
                    note: `Takvim kaydından: ${entry.title}`,
                });
                break;
            }
            case cashflow_calendar_entity_1.CashflowEntryType.CHECK:
            case cashflow_calendar_entity_1.CashflowEntryType.OTHER: {
                const isIncome = entry.direction === 'income';
                await this.assetTransactionRepo.save(this.assetTransactionRepo.create({
                    contractorId,
                    transactionType: isIncome
                        ? asset_transaction_entity_1.AssetTransactionType.MANUAL_ADDITION
                        : asset_transaction_entity_1.AssetTransactionType.MANUAL_DEDUCTION,
                    amount: isIncome ? entry.currentAmount : -entry.currentAmount,
                    sourceTable: 'cashflow_calendar',
                    sourceId: entry.id,
                    transactionDate: new Date(dto.paidDate),
                    description: entry.title,
                }));
                break;
            }
        }
        entry.status = cashflow_calendar_entity_1.CashflowStatus.PAID;
        entry.paidDate = new Date(dto.paidDate);
        return this.calendarRepo.save(entry);
    }
    async handleDailyAccrualCron() {
        this.logger.log('Günlük faiz işletme zamanlayıcısı başladı...');
        const result = await this.runDailyAccrual();
        this.logger.log(`Tamamlandı: ${result.markedOverdue} kayıt gecikmiş işaretlendi, ` +
            `${result.interestApplied} kayda faiz işlendi, ${result.skipped} kayıt atlandı.`);
    }
    async runDailyAccrual() {
        const overdueResult = await this.dataSource.query(`UPDATE cashflow_calendar
       SET status = 'overdue', updated_at = now()
       WHERE status = 'pending' AND due_date < CURRENT_DATE
       RETURNING id`);
        const markedOverdue = overdueResult.length;
        const overdueEntries = await this.calendarRepo
            .createQueryBuilder('entry')
            .where('entry.status = :status', { status: cashflow_calendar_entity_1.CashflowStatus.OVERDUE })
            .andWhere('entry.dailyInterestRate IS NOT NULL')
            .getMany();
        let interestApplied = 0;
        let skipped = 0;
        for (const entry of overdueEntries) {
            const interest = Number(entry.originalAmount) * Number(entry.dailyInterestRate);
            const balanceBefore = Number(entry.currentAmount);
            const balanceAfter = balanceBefore + interest;
            const inserted = await this.dataSource.query(`INSERT INTO cashflow_interest_accruals
           (calendar_entry_id, accrual_date, interest_amount, balance_before, balance_after)
         VALUES ($1, CURRENT_DATE, $2, $3, $4)
         ON CONFLICT (calendar_entry_id, accrual_date) DO NOTHING
         RETURNING id`, [entry.id, interest, balanceBefore, balanceAfter]);
            if (inserted.length > 0) {
                await this.calendarRepo.update(entry.id, { currentAmount: balanceAfter });
                interestApplied++;
            }
            else {
                skipped++;
            }
        }
        return { markedOverdue, interestApplied, skipped };
    }
};
exports.CashflowService = CashflowService;
__decorate([
    (0, schedule_1.Cron)('5 0 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CashflowService.prototype, "handleDailyAccrualCron", null);
exports.CashflowService = CashflowService = CashflowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cashflow_calendar_entity_1.CashflowCalendar)),
    __param(1, (0, typeorm_1.InjectRepository)(cashflow_interest_accrual_entity_1.CashflowInterestAccrual)),
    __param(2, (0, typeorm_1.InjectRepository)(asset_transaction_entity_1.AssetTransaction)),
    __param(3, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        payments_service_1.PaymentsService,
        assets_service_1.AssetsService])
], CashflowService);
//# sourceMappingURL=cashflow.service.js.map