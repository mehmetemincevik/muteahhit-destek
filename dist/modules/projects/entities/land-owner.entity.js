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
exports.LandOwner = void 0;
const typeorm_1 = require("typeorm");
const land_entity_1 = require("./land.entity");
let LandOwner = class LandOwner {
};
exports.LandOwner = LandOwner;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LandOwner.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'land_id', type: 'uuid' }),
    __metadata("design:type", String)
], LandOwner.prototype, "landId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => land_entity_1.Land, (land) => land.owners),
    (0, typeorm_1.JoinColumn)({ name: 'land_id' }),
    __metadata("design:type", land_entity_1.Land)
], LandOwner.prototype, "land", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'full_name', type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], LandOwner.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], LandOwner.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'share_percentage', type: 'numeric', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], LandOwner.prototype, "sharePercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tc_or_vkn', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], LandOwner.prototype, "tcOrVkn", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LandOwner.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], LandOwner.prototype, "createdAt", void 0);
exports.LandOwner = LandOwner = __decorate([
    (0, typeorm_1.Entity)('land_owners')
], LandOwner);
//# sourceMappingURL=land-owner.entity.js.map