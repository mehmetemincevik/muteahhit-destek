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
exports.CostCategory = exports.CostType = void 0;
const typeorm_1 = require("typeorm");
var CostType;
(function (CostType) {
    CostType["FIXED"] = "fixed";
    CostType["VARIABLE"] = "variable";
})(CostType || (exports.CostType = CostType = {}));
let CostCategory = class CostCategory {
};
exports.CostCategory = CostCategory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CostCategory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], CostCategory.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cost_type', type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], CostCategory.prototype, "costType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_system_default', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], CostCategory.prototype, "isSystemDefault", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CostCategory.prototype, "createdAt", void 0);
exports.CostCategory = CostCategory = __decorate([
    (0, typeorm_1.Entity)('cost_categories')
], CostCategory);
//# sourceMappingURL=cost-category.entity.js.map