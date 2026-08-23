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
exports.CraftsmanServicePackage = exports.PriceType = void 0;
const typeorm_1 = require("typeorm");
const craftsman_profile_entity_1 = require("./craftsman-profile.entity");
const service_package_item_entity_1 = require("./service-package-item.entity");
var PriceType;
(function (PriceType) {
    PriceType["PER_M2"] = "per_m2";
    PriceType["FIXED"] = "fixed";
    PriceType["NEGOTIABLE"] = "negotiable";
})(PriceType || (exports.PriceType = PriceType = {}));
let CraftsmanServicePackage = class CraftsmanServicePackage {
};
exports.CraftsmanServicePackage = CraftsmanServicePackage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CraftsmanServicePackage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'craftsman_id', type: 'uuid' }),
    __metadata("design:type", String)
], CraftsmanServicePackage.prototype, "craftsmanId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => craftsman_profile_entity_1.CraftsmanProfile),
    (0, typeorm_1.JoinColumn)({ name: 'craftsman_id' }),
    __metadata("design:type", craftsman_profile_entity_1.CraftsmanProfile)
], CraftsmanServicePackage.prototype, "craftsman", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'template_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CraftsmanServicePackage.prototype, "templateId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], CraftsmanServicePackage.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CraftsmanServicePackage.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_type', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], CraftsmanServicePackage.prototype, "priceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_amount', type: 'numeric', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], CraftsmanServicePackage.prototype, "priceAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], CraftsmanServicePackage.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => service_package_item_entity_1.ServicePackageItem, (item) => item.package),
    __metadata("design:type", Array)
], CraftsmanServicePackage.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CraftsmanServicePackage.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CraftsmanServicePackage.prototype, "updatedAt", void 0);
exports.CraftsmanServicePackage = CraftsmanServicePackage = __decorate([
    (0, typeorm_1.Entity)('craftsman_service_packages')
], CraftsmanServicePackage);
//# sourceMappingURL=craftsman-service-package.entity.js.map