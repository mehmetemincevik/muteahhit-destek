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
exports.ServicePackageTemplate = void 0;
const typeorm_1 = require("typeorm");
const service_package_template_item_entity_1 = require("./service-package-template-item.entity");
let ServicePackageTemplate = class ServicePackageTemplate {
};
exports.ServicePackageTemplate = ServicePackageTemplate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ServicePackageTemplate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], ServicePackageTemplate.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ServicePackageTemplate.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ServicePackageTemplate.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ServicePackageTemplate.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => service_package_template_item_entity_1.ServicePackageTemplateItem, (item) => item.template),
    __metadata("design:type", Array)
], ServicePackageTemplate.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ServicePackageTemplate.prototype, "createdAt", void 0);
exports.ServicePackageTemplate = ServicePackageTemplate = __decorate([
    (0, typeorm_1.Entity)('service_package_templates')
], ServicePackageTemplate);
//# sourceMappingURL=service-package-template.entity.js.map