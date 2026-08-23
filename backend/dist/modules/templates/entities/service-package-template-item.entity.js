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
exports.ServicePackageTemplateItem = exports.DefaultPriceType = void 0;
const typeorm_1 = require("typeorm");
const service_package_template_entity_1 = require("./service-package-template.entity");
var DefaultPriceType;
(function (DefaultPriceType) {
    DefaultPriceType["PER_M2"] = "per_m2";
    DefaultPriceType["FIXED"] = "fixed";
    DefaultPriceType["NEGOTIABLE"] = "negotiable";
})(DefaultPriceType || (exports.DefaultPriceType = DefaultPriceType = {}));
let ServicePackageTemplateItem = class ServicePackageTemplateItem {
};
exports.ServicePackageTemplateItem = ServicePackageTemplateItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ServicePackageTemplateItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'template_id', type: 'uuid' }),
    __metadata("design:type", String)
], ServicePackageTemplateItem.prototype, "templateId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_package_template_entity_1.ServicePackageTemplate, (template) => template.items),
    (0, typeorm_1.JoinColumn)({ name: 'template_id' }),
    __metadata("design:type", service_package_template_entity_1.ServicePackageTemplate)
], ServicePackageTemplateItem.prototype, "template", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'item_name', type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], ServicePackageTemplateItem.prototype, "itemName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_price_type', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], ServicePackageTemplateItem.prototype, "defaultPriceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'display_order', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ServicePackageTemplateItem.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ServicePackageTemplateItem.prototype, "createdAt", void 0);
exports.ServicePackageTemplateItem = ServicePackageTemplateItem = __decorate([
    (0, typeorm_1.Entity)('service_package_template_items')
], ServicePackageTemplateItem);
//# sourceMappingURL=service-package-template-item.entity.js.map