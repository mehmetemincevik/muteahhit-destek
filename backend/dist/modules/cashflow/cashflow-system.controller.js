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
exports.CashflowSystemController = void 0;
const common_1 = require("@nestjs/common");
const api_key_guard_1 = require("../../common/guards/api-key.guard");
const cashflow_service_1 = require("./cashflow.service");
let CashflowSystemController = class CashflowSystemController {
    constructor(cashflowService) {
        this.cashflowService = cashflowService;
    }
    runDailyAccrual() {
        return this.cashflowService.runDailyAccrual();
    }
};
exports.CashflowSystemController = CashflowSystemController;
__decorate([
    (0, common_1.Post)('run-daily-accrual'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CashflowSystemController.prototype, "runDailyAccrual", null);
exports.CashflowSystemController = CashflowSystemController = __decorate([
    (0, common_1.Controller)('system/cashflow'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    __metadata("design:paramtypes", [cashflow_service_1.CashflowService])
], CashflowSystemController);
//# sourceMappingURL=cashflow-system.controller.js.map