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
exports.Unit = exports.UnitOwnershipStatus = void 0;
const typeorm_1 = require("typeorm");
const block_entity_1 = require("./block.entity");
const buyer_entity_1 = require("./buyer.entity");
const land_owner_entity_1 = require("../../projects/entities/land-owner.entity");
var UnitOwnershipStatus;
(function (UnitOwnershipStatus) {
    UnitOwnershipStatus["AVAILABLE"] = "available";
    UnitOwnershipStatus["SOLD"] = "sold";
    UnitOwnershipStatus["GIVEN_TO_LAND_OWNER"] = "given_to_land_owner";
})(UnitOwnershipStatus || (exports.UnitOwnershipStatus = UnitOwnershipStatus = {}));
let Unit = class Unit {
};
exports.Unit = Unit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Unit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'block_id', type: 'uuid' }),
    __metadata("design:type", String)
], Unit.prototype, "blockId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => block_entity_1.Block, (block) => block.units),
    (0, typeorm_1.JoinColumn)({ name: 'block_id' }),
    __metadata("design:type", block_entity_1.Block)
], Unit.prototype, "block", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'floor_no', type: 'int' }),
    __metadata("design:type", Number)
], Unit.prototype, "floorNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_no', type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], Unit.prototype, "unitNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'room_layout', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], Unit.prototype, "roomLayout", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gross_m2', type: 'numeric', precision: 8, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Unit.prototype, "grossM2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'net_m2', type: 'numeric', precision: 8, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Unit.prototype, "netM2", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'ownership_status',
        type: 'varchar',
        length: 30,
        default: UnitOwnershipStatus.AVAILABLE,
    }),
    __metadata("design:type", String)
], Unit.prototype, "ownershipStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sale_price', type: 'numeric', precision: 14, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Unit.prototype, "salePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'estimated_sale_value',
        type: 'numeric',
        precision: 14,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Number)
], Unit.prototype, "estimatedSaleValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'buyer_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Unit.prototype, "buyerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => buyer_entity_1.Buyer, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'buyer_id' }),
    __metadata("design:type", buyer_entity_1.Buyer)
], Unit.prototype, "buyer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'land_owner_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Unit.prototype, "landOwnerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => land_owner_entity_1.LandOwner, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'land_owner_id' }),
    __metadata("design:type", land_owner_entity_1.LandOwner)
], Unit.prototype, "landOwner", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Unit.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Unit.prototype, "updatedAt", void 0);
exports.Unit = Unit = __decorate([
    (0, typeorm_1.Entity)('units')
], Unit);
//# sourceMappingURL=unit.entity.js.map