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
exports.RentalPayment = void 0;
const typeorm_1 = require("typeorm");
const asset_rental_entity_1 = require("./asset-rental.entity");
let RentalPayment = class RentalPayment {
};
exports.RentalPayment = RentalPayment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RentalPayment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rental_id', type: 'uuid' }),
    __metadata("design:type", String)
], RentalPayment.prototype, "rentalId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => asset_rental_entity_1.AssetRental),
    (0, typeorm_1.JoinColumn)({ name: 'rental_id' }),
    __metadata("design:type", asset_rental_entity_1.AssetRental)
], RentalPayment.prototype, "rental", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], RentalPayment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_date', type: 'date' }),
    __metadata("design:type", Date)
], RentalPayment.prototype, "paymentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RentalPayment.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], RentalPayment.prototype, "createdAt", void 0);
exports.RentalPayment = RentalPayment = __decorate([
    (0, typeorm_1.Entity)('rental_payments')
], RentalPayment);
//# sourceMappingURL=rental-payment.entity.js.map