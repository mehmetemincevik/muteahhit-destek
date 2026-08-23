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
exports.Asset = exports.AssetType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var AssetType;
(function (AssetType) {
    AssetType["CASH"] = "cash";
    AssetType["COMMODITY"] = "commodity";
    AssetType["REAL_ESTATE"] = "real_estate";
    AssetType["OTHER"] = "other";
})(AssetType || (exports.AssetType = AssetType = {}));
let Asset = class Asset {
};
exports.Asset = Asset;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Asset.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contractor_id', type: 'uuid' }),
    __metadata("design:type", String)
], Asset.prototype, "contractorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'contractor_id' }),
    __metadata("design:type", user_entity_1.User)
], Asset.prototype, "contractor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asset_type', type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], Asset.prototype, "assetType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], Asset.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Asset.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_value', type: 'numeric', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Asset.prototype, "currentValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'value_updated_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Asset.prototype, "valueUpdatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Asset.prototype, "province", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Asset.prototype, "district", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'room_layout', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], Asset.prototype, "roomLayout", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'area_m2', type: 'numeric', precision: 8, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Asset.prototype, "areaM2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_generating_rental_income', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Asset.prototype, "isGeneratingRentalIncome", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Asset.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Asset.prototype, "updatedAt", void 0);
exports.Asset = Asset = __decorate([
    (0, typeorm_1.Entity)('assets')
], Asset);
//# sourceMappingURL=asset.entity.js.map