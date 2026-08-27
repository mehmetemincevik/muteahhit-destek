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
exports.CashflowController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const cashflow_service_1 = require("./cashflow.service");
const create_cashflow_entry_dto_1 = require("./dto/create-cashflow-entry.dto");
const mark_as_paid_dto_1 = require("./dto/mark-as-paid.dto");
let CashflowController = class CashflowController {
    constructor(cashflowService) {
        this.cashflowService = cashflowService;
    }
    create(user, dto) {
        return this.cashflowService.create(user.userId, dto);
    }
    findAll(user) {
        return this.cashflowService.findAllForContractor(user.userId);
    }
    findOne(entryId, user) {
        return this.cashflowService.getEntryDetail(user.userId, entryId);
    }
    markAsPaid(entryId, user, dto) {
        return this.cashflowService.markAsPaid(user.userId, entryId, dto);
    }
};
exports.CashflowController = CashflowController;
__decorate([
    (0, common_1.Post)('entries'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_cashflow_entry_dto_1.CreateCashflowEntryDto]),
    __metadata("design:returntype", void 0)
], CashflowController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('entries'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CashflowController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('entries/:entryId'),
    __param(0, (0, common_1.Param)('entryId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CashflowController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('entries/:entryId/mark-paid'),
    __param(0, (0, common_1.Param)('entryId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, mark_as_paid_dto_1.MarkAsPaidDto]),
    __metadata("design:returntype", void 0)
], CashflowController.prototype, "markAsPaid", null);
exports.CashflowController = CashflowController = __decorate([
    (0, common_1.Controller)('cashflow'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('contractor'),
    __metadata("design:paramtypes", [cashflow_service_1.CashflowService])
], CashflowController);
//# sourceMappingURL=cashflow.controller.js.map