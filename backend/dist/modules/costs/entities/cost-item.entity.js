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
exports.CostItem = exports.CostSource = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("../../projects/entities/project.entity");
const cost_category_entity_1 = require("./cost-category.entity");
var CostSource;
(function (CostSource) {
    CostSource["MANUAL"] = "manual";
    CostSource["ARCHITECTURAL_PROJECT"] = "architectural_project";
    CostSource["STATIC_PROJECT"] = "static_project";
})(CostSource || (exports.CostSource = CostSource = {}));
let CostItem = class CostItem {
};
exports.CostItem = CostItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CostItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id', type: 'uuid' }),
    __metadata("design:type", String)
], CostItem.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], CostItem.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_id', type: 'uuid' }),
    __metadata("design:type", String)
], CostItem.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cost_category_entity_1.CostCategory),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", cost_category_entity_1.CostCategory)
], CostItem.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], CostItem.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 14, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], CostItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], CostItem.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'numeric', precision: 14, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], CostItem.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_cost', type: 'numeric', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], CostItem.prototype, "totalCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: CostSource.MANUAL }),
    __metadata("design:type", String)
], CostItem.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'extra_specs', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], CostItem.prototype, "extraSpecs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'incurred_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], CostItem.prototype, "incurredDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CostItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CostItem.prototype, "updatedAt", void 0);
exports.CostItem = CostItem = __decorate([
    (0, typeorm_1.Entity)('cost_items')
], CostItem);
//# sourceMappingURL=cost-item.entity.js.map