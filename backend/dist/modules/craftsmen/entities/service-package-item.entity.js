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
exports.ServicePackageItem = void 0;
const typeorm_1 = require("typeorm");
const craftsman_service_package_entity_1 = require("./craftsman-service-package.entity");
let ServicePackageItem = class ServicePackageItem {
};
exports.ServicePackageItem = ServicePackageItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ServicePackageItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'package_id', type: 'uuid' }),
    __metadata("design:type", String)
], ServicePackageItem.prototype, "packageId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => craftsman_service_package_entity_1.CraftsmanServicePackage, (pkg) => pkg.items),
    (0, typeorm_1.JoinColumn)({ name: 'package_id' }),
    __metadata("design:type", craftsman_service_package_entity_1.CraftsmanServicePackage)
], ServicePackageItem.prototype, "package", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'item_name', type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], ServicePackageItem.prototype, "itemName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_type', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], ServicePackageItem.prototype, "priceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_amount', type: 'numeric', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ServicePackageItem.prototype, "priceAmount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ServicePackageItem.prototype, "createdAt", void 0);
exports.ServicePackageItem = ServicePackageItem = __decorate([
    (0, typeorm_1.Entity)('service_package_items')
], ServicePackageItem);
//# sourceMappingURL=service-package-item.entity.js.map