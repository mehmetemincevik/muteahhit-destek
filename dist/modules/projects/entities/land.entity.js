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
exports.Land = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("./project.entity");
const land_owner_entity_1 = require("./land-owner.entity");
let Land = class Land {
};
exports.Land = Land;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Land.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id', type: 'uuid' }),
    __metadata("design:type", String)
], Land.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => project_entity_1.Project),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], Land.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Land.prototype, "province", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Land.prototype, "district", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], Land.prototype, "neighborhood", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ada_no', type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", String)
], Land.prototype, "adaNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parsel_no', type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", String)
], Land.prototype, "parselNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'area_m2', type: 'numeric', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Land.prototype, "areaM2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'purchase_price', type: 'numeric', precision: 14, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Land.prototype, "purchasePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'purchase_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Land.prototype, "purchaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_kat_karsiligi', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Land.prototype, "isKatKarsiligi", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Land.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => land_owner_entity_1.LandOwner, (owner) => owner.land),
    __metadata("design:type", Array)
], Land.prototype, "owners", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Land.prototype, "createdAt", void 0);
exports.Land = Land = __decorate([
    (0, typeorm_1.Entity)('land')
], Land);
//# sourceMappingURL=land.entity.js.map