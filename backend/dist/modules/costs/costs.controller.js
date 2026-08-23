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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const costs_service_1 = require("./costs.service");
const create_cost_category_dto_1 = require("./dto/create-cost-category.dto");
const create_cost_item_dto_1 = require("./dto/create-cost-item.dto");
const create_cost_payment_dto_1 = require("./dto/create-cost-payment.dto");
let CostsController = class CostsController {
    constructor(costsService) {
        this.costsService = costsService;
    }
    createCategory(dto) {
        return this.costsService.createCategory(dto);
    }
    findCategories() {
        return this.costsService.findCategories();
    }
    createCostItem(projectId, user, dto) {
        return this.costsService.createCostItem(user.userId, projectId, dto);
    }
    findCostItemsByProject(projectId, user) {
        return this.costsService.findCostItemsByProject(user.userId, projectId);
    }
    getProjectCostSummary(projectId, user) {
        return this.costsService.getProjectCostSummary(user.userId, projectId);
    }
    createCostPayment(costItemId, user, dto) {
        return this.costsService.createCostPayment(user.userId, costItemId, dto);
    }
    getCostItemBalance(costItemId, user) {
        return this.costsService.getCostItemBalance(user.userId, costItemId);
    }
};
exports.CostsController = CostsController;
__decorate([
    (0, common_1.Post)('cost-categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_cost_category_dto_1.CreateCostCategoryDto]),
    __metadata("design:returntype", void 0)
], CostsController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('cost-categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CostsController.prototype, "findCategories", null);
__decorate([
    (0, common_1.Post)('projects/:projectId/cost-items'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_cost_item_dto_1.CreateCostItemDto]),
    __metadata("design:returntype", void 0)
], CostsController.prototype, "createCostItem", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/cost-items'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CostsController.prototype, "findCostItemsByProject", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/cost-summary'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CostsController.prototype, "getProjectCostSummary", null);
__decorate([
    (0, common_1.Post)('cost-items/:costItemId/payments'),
    __param(0, (0, common_1.Param)('costItemId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_cost_payment_dto_1.CreateCostPaymentDto]),
    __metadata("design:returntype", void 0)
], CostsController.prototype, "createCostPayment", null);
__decorate([
    (0, common_1.Get)('cost-items/:costItemId/balance'),
    __param(0, (0, common_1.Param)('costItemId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CostsController.prototype, "getCostItemBalance", null);
exports.CostsController = CostsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [costs_service_1.CostsService])
], CostsController);
//# sourceMappingURL=costs.controller.js.map