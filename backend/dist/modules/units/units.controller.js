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
exports.UnitsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const units_service_1 = require("./units.service");
const create_block_dto_1 = require("./dto/create-block.dto");
const create_unit_dto_1 = require("./dto/create-unit.dto");
const create_buyer_dto_1 = require("./dto/create-buyer.dto");
const update_unit_status_dto_1 = require("./dto/update-unit-status.dto");
let UnitsController = class UnitsController {
    constructor(unitsService) {
        this.unitsService = unitsService;
    }
    createBuyer(user, dto) {
        return this.unitsService.createBuyer(user.userId, dto);
    }
    findBuyers(user) {
        return this.unitsService.findBuyers(user.userId);
    }
    createBlock(projectId, user, dto) {
        return this.unitsService.createBlock(user.userId, projectId, dto);
    }
    findByProject(projectId, user) {
        return this.unitsService.findByProject(user.userId, projectId);
    }
    createUnit(blockId, user, dto) {
        return this.unitsService.createUnit(user.userId, blockId, dto);
    }
    updateStatus(unitId, user, dto) {
        return this.unitsService.updateStatus(user.userId, unitId, dto);
    }
};
exports.UnitsController = UnitsController;
__decorate([
    (0, common_1.Post)('buyers'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_buyer_dto_1.CreateBuyerDto]),
    __metadata("design:returntype", void 0)
], UnitsController.prototype, "createBuyer", null);
__decorate([
    (0, common_1.Get)('buyers'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UnitsController.prototype, "findBuyers", null);
__decorate([
    (0, common_1.Post)('projects/:projectId/blocks'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_block_dto_1.CreateBlockDto]),
    __metadata("design:returntype", void 0)
], UnitsController.prototype, "createBlock", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/blocks'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UnitsController.prototype, "findByProject", null);
__decorate([
    (0, common_1.Post)('blocks/:blockId/units'),
    __param(0, (0, common_1.Param)('blockId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_unit_dto_1.CreateUnitDto]),
    __metadata("design:returntype", void 0)
], UnitsController.prototype, "createUnit", null);
__decorate([
    (0, common_1.Patch)('units/:unitId/status'),
    __param(0, (0, common_1.Param)('unitId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_unit_status_dto_1.UpdateUnitStatusDto]),
    __metadata("design:returntype", void 0)
], UnitsController.prototype, "updateStatus", null);
exports.UnitsController = UnitsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('contractor'),
    __metadata("design:paramtypes", [units_service_1.UnitsService])
], UnitsController);
//# sourceMappingURL=units.controller.js.map