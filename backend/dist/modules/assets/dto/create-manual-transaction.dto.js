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
exports.CreateManualTransactionDto = void 0;
const class_validator_1 = require("class-validator");
class CreateManualTransactionDto {
}
exports.CreateManualTransactionDto = CreateManualTransactionDto;
__decorate([
    (0, class_validator_1.IsIn)(['manual_addition', 'manual_deduction'], {
        message: 'direction sadece manual_addition veya manual_deduction olabilir',
    }),
    __metadata("design:type", String)
], CreateManualTransactionDto.prototype, "direction", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)({ message: 'Tutar sıfırdan büyük olmalı (yön zaten ekleme/çıkarma belirtiyor)' }),
    __metadata("design:type", Number)
], CreateManualTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateManualTransactionDto.prototype, "transactionDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateManualTransactionDto.prototype, "description", void 0);
//# sourceMappingURL=create-manual-transaction.dto.js.map