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
exports.CreateCashflowEntryDto = void 0;
const class_validator_1 = require("class-validator");
const cashflow_calendar_entity_1 = require("../entities/cashflow-calendar.entity");
class CreateCashflowEntryDto {
}
exports.CreateCashflowEntryDto = CreateCashflowEntryDto;
__decorate([
    (0, class_validator_1.IsEnum)(cashflow_calendar_entity_1.CashflowEntryType),
    __metadata("design:type", String)
], CreateCashflowEntryDto.prototype, "entryType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(cashflow_calendar_entity_1.CashflowDirection),
    __metadata("design:type", String)
], CreateCashflowEntryDto.prototype, "direction", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCashflowEntryDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateCashflowEntryDto.prototype, "originalAmount", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCashflowEntryDto.prototype, "dueDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1, { message: 'Günlük faiz oranı ondalık olmalı (örn. %0,14 için 0.0014), yüzde değil' }),
    __metadata("design:type", Number)
], CreateCashflowEntryDto.prototype, "dailyInterestRate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCashflowEntryDto.prototype, "unitId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCashflowEntryDto.prototype, "rentalId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCashflowEntryDto.prototype, "notes", void 0);
//# sourceMappingURL=create-cashflow-entry.dto.js.map