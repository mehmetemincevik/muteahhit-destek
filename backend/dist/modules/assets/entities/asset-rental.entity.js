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
exports.AssetRental = void 0;
const typeorm_1 = require("typeorm");
const asset_entity_1 = require("./asset.entity");
let AssetRental = class AssetRental {
};
exports.AssetRental = AssetRental;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AssetRental.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asset_id', type: 'uuid' }),
    __metadata("design:type", String)
], AssetRental.prototype, "assetId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => asset_entity_1.Asset),
    (0, typeorm_1.JoinColumn)({ name: 'asset_id' }),
    __metadata("design:type", asset_entity_1.Asset)
], AssetRental.prototype, "asset", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_name', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], AssetRental.prototype, "tenantName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_phone', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], AssetRental.prototype, "tenantPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monthly_rent', type: 'numeric', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], AssetRental.prototype, "monthlyRent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_start_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], AssetRental.prototype, "contractStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], AssetRental.prototype, "contractEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], AssetRental.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AssetRental.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AssetRental.prototype, "createdAt", void 0);
exports.AssetRental = AssetRental = __decorate([
    (0, typeorm_1.Entity)('asset_rentals')
], AssetRental);
//# sourceMappingURL=asset-rental.entity.js.map