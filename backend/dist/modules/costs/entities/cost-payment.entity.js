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
exports.CostPayment = exports.CostPaymentMethod = void 0;
const typeorm_1 = require("typeorm");
const cost_item_entity_1 = require("./cost-item.entity");
var CostPaymentMethod;
(function (CostPaymentMethod) {
    CostPaymentMethod["CASH"] = "cash";
    CostPaymentMethod["BANK_TRANSFER"] = "bank_transfer";
    CostPaymentMethod["CHECK"] = "check";
    CostPaymentMethod["OTHER"] = "other";
})(CostPaymentMethod || (exports.CostPaymentMethod = CostPaymentMethod = {}));
let CostPayment = class CostPayment {
};
exports.CostPayment = CostPayment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CostPayment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cost_item_id', type: 'uuid' }),
    __metadata("design:type", String)
], CostPayment.prototype, "costItemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cost_item_entity_1.CostItem),
    (0, typeorm_1.JoinColumn)({ name: 'cost_item_id' }),
    __metadata("design:type", cost_item_entity_1.CostItem)
], CostPayment.prototype, "costItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], CostPayment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_date', type: 'date' }),
    __metadata("design:type", Date)
], CostPayment.prototype, "paymentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_method', type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", String)
], CostPayment.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CostPayment.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CostPayment.prototype, "createdAt", void 0);
exports.CostPayment = CostPayment = __decorate([
    (0, typeorm_1.Entity)('cost_payments')
], CostPayment);
//# sourceMappingURL=cost-payment.entity.js.map