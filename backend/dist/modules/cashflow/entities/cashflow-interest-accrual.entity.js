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
exports.CashflowInterestAccrual = void 0;
const typeorm_1 = require("typeorm");
const cashflow_calendar_entity_1 = require("./cashflow-calendar.entity");
let CashflowInterestAccrual = class CashflowInterestAccrual {
};
exports.CashflowInterestAccrual = CashflowInterestAccrual;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CashflowInterestAccrual.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calendar_entry_id', type: 'uuid' }),
    __metadata("design:type", String)
], CashflowInterestAccrual.prototype, "calendarEntryId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cashflow_calendar_entity_1.CashflowCalendar),
    (0, typeorm_1.JoinColumn)({ name: 'calendar_entry_id' }),
    __metadata("design:type", cashflow_calendar_entity_1.CashflowCalendar)
], CashflowInterestAccrual.prototype, "calendarEntry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'accrual_date', type: 'date' }),
    __metadata("design:type", Date)
], CashflowInterestAccrual.prototype, "accrualDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'interest_amount', type: 'numeric', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], CashflowInterestAccrual.prototype, "interestAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'balance_before', type: 'numeric', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], CashflowInterestAccrual.prototype, "balanceBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'balance_after', type: 'numeric', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], CashflowInterestAccrual.prototype, "balanceAfter", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CashflowInterestAccrual.prototype, "createdAt", void 0);
exports.CashflowInterestAccrual = CashflowInterestAccrual = __decorate([
    (0, typeorm_1.Entity)('cashflow_interest_accruals'),
    (0, typeorm_1.Unique)(['calendarEntryId', 'accrualDate'])
], CashflowInterestAccrual);
//# sourceMappingURL=cashflow-interest-accrual.entity.js.map