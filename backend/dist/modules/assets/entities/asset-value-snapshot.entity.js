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
exports.AssetValueSnapshot = void 0;
const typeorm_1 = require("typeorm");
const asset_entity_1 = require("./asset.entity");
let AssetValueSnapshot = class AssetValueSnapshot {
};
exports.AssetValueSnapshot = AssetValueSnapshot;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AssetValueSnapshot.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asset_id', type: 'uuid' }),
    __metadata("design:type", String)
], AssetValueSnapshot.prototype, "assetId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => asset_entity_1.Asset),
    (0, typeorm_1.JoinColumn)({ name: 'asset_id' }),
    __metadata("design:type", asset_entity_1.Asset)
], AssetValueSnapshot.prototype, "asset", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estimated_value', type: 'numeric', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], AssetValueSnapshot.prototype, "estimatedValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'snapshot_date', type: 'date' }),
    __metadata("design:type", Date)
], AssetValueSnapshot.prototype, "snapshotDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, default: 'tcmb_index' }),
    __metadata("design:type", String)
], AssetValueSnapshot.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AssetValueSnapshot.prototype, "createdAt", void 0);
exports.AssetValueSnapshot = AssetValueSnapshot = __decorate([
    (0, typeorm_1.Entity)('asset_value_snapshots')
], AssetValueSnapshot);
//# sourceMappingURL=asset-value-snapshot.entity.js.map