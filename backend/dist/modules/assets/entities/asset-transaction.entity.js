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
exports.AssetTransaction = exports.AssetTransactionType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const asset_entity_1 = require("./asset.entity");
var AssetTransactionType;
(function (AssetTransactionType) {
    AssetTransactionType["UNIT_SALE_PAYMENT"] = "unit_sale_payment";
    AssetTransactionType["RENTAL_INCOME"] = "rental_income";
    AssetTransactionType["MANUAL_ADDITION"] = "manual_addition";
    AssetTransactionType["MANUAL_DEDUCTION"] = "manual_deduction";
    AssetTransactionType["COST_PAYMENT"] = "cost_payment";
})(AssetTransactionType || (exports.AssetTransactionType = AssetTransactionType = {}));
let AssetTransaction = class AssetTransaction {
};
exports.AssetTransaction = AssetTransaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AssetTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contractor_id', type: 'uuid' }),
    __metadata("design:type", String)
], AssetTransaction.prototype, "contractorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'contractor_id' }),
    __metadata("design:type", user_entity_1.User)
], AssetTransaction.prototype, "contractor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asset_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AssetTransaction.prototype, "assetId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => asset_entity_1.Asset, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'asset_id' }),
    __metadata("design:type", asset_entity_1.Asset)
], AssetTransaction.prototype, "asset", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_type', type: 'varchar', length: 30 }),
    __metadata("design:type", String)
], AssetTransaction.prototype, "transactionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], AssetTransaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_table', type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", String)
], AssetTransaction.prototype, "sourceTable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AssetTransaction.prototype, "sourceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AssetTransaction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_date', type: 'date' }),
    __metadata("design:type", Date)
], AssetTransaction.prototype, "transactionDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AssetTransaction.prototype, "createdAt", void 0);
exports.AssetTransaction = AssetTransaction = __decorate([
    (0, typeorm_1.Entity)('asset_transactions')
], AssetTransaction);
//# sourceMappingURL=asset-transaction.entity.js.map