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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashflowCalendar = exports.CashflowStatus = exports.CashflowDirection = exports.CashflowEntryType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var CashflowEntryType;
(function (CashflowEntryType) {
    CashflowEntryType["CHECK"] = "check";
    CashflowEntryType["RENT"] = "rent";
    CashflowEntryType["INSTALLMENT_PAYMENT"] = "installment_payment";
    CashflowEntryType["OTHER"] = "other";
})(CashflowEntryType || (exports.CashflowEntryType = CashflowEntryType = {}));
var CashflowDirection;
(function (CashflowDirection) {
    CashflowDirection["INCOME"] = "income";
    CashflowDirection["EXPENSE"] = "expense";
})(CashflowDirection || (exports.CashflowDirection = CashflowDirection = {}));
var CashflowStatus;
(function (CashflowStatus) {
    CashflowStatus["PENDING"] = "pending";
    CashflowStatus["PAID"] = "paid";
    CashflowStatus["OVERDUE"] = "overdue";
})(CashflowStatus || (exports.CashflowStatus = CashflowStatus = {}));
let CashflowCalendar = class CashflowCalendar {
};
exports.CashflowCalendar = CashflowCalendar;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CashflowCalendar.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contractor_id', type: 'uuid' }),
    __metadata("design:type", String)
], CashflowCalendar.prototype, "contractorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'contractor_id' }),
    __metadata("design:type", user_entity_1.User)
], CashflowCalendar.prototype, "contractor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entry_type', type: 'varchar', length: 30 }),
    __metadata("design:type", String)
], CashflowCalendar.prototype, "entryType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], CashflowCalendar.prototype, "direction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], CashflowCalendar.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_amount', type: 'numeric', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], CashflowCalendar.prototype, "originalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_amount', type: 'numeric', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], CashflowCalendar.prototype, "currentAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_date', type: 'date' }),
    __metadata("design:type", Date)
], CashflowCalendar.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: CashflowStatus.PENDING }),
    __metadata("design:type", String)
], CashflowCalendar.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paid_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], CashflowCalendar.prototype, "paidDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'daily_interest_rate', type: 'numeric', precision: 6, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], CashflowCalendar.prototype, "dailyInterestRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_table', type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", String)
], CashflowCalendar.prototype, "sourceTable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CashflowCalendar.prototype, "sourceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CashflowCalendar.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CashflowCalendar.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CashflowCalendar.prototype, "updatedAt", void 0);
exports.CashflowCalendar = CashflowCalendar = __decorate([
    (0, typeorm_1.Entity)('cashflow_calendar')
], CashflowCalendar);
//# sourceMappingURL=cashflow-calendar.entity.js.map