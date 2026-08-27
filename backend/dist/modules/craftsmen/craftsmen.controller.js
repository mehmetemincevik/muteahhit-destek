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
exports.CraftsmenController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const craftsmen_service_1 = require("./craftsmen.service");
const upsert_profile_dto_1 = require("./dto/upsert-profile.dto");
const create_package_dto_1 = require("./dto/create-package.dto");
const create_package_item_dto_1 = require("./dto/create-package-item.dto");
const add_portfolio_image_dto_1 = require("./dto/add-portfolio-image.dto");
const create_review_dto_1 = require("./dto/create-review.dto");
const create_assignment_dto_1 = require("./dto/create-assignment.dto");
const update_assignment_status_dto_1 = require("./dto/update-assignment-status.dto");
let CraftsmenController = class CraftsmenController {
    constructor(craftsmenService) {
        this.craftsmenService = craftsmenService;
    }
    upsertProfile(user, dto) {
        return this.craftsmenService.upsertProfile(user.userId, dto);
    }
    getMyProfile(user) {
        return this.craftsmenService.getMyProfile(user.userId);
    }
    findAll(province, district) {
        return this.craftsmenService.findAllProfiles({ province, district });
    }
    findMyAssignments(user) {
        return this.craftsmenService.findAssignmentsForCraftsman(user.userId);
    }
    getProfileDetail(craftsmanId) {
        return this.craftsmenService.getProfileDetail(craftsmanId);
    }
    createPackage(user, dto) {
        return this.craftsmenService.createPackage(user.userId, dto);
    }
    addPackageItem(packageId, user, dto) {
        return this.craftsmenService.addPackageItem(user.userId, packageId, dto);
    }
    addPortfolioImage(user, dto) {
        return this.craftsmenService.addPortfolioImage(user.userId, dto);
    }
    createReview(user, dto) {
        return this.craftsmenService.createReview(user.userId, dto);
    }
    createAssignment(projectId, user, dto) {
        return this.craftsmenService.createAssignment(user.userId, projectId, dto);
    }
    findAssignmentsByProject(projectId, user) {
        return this.craftsmenService.findAssignmentsByProject(user.userId, projectId);
    }
    updateAssignmentStatus(assignmentId, user, dto) {
        return this.craftsmenService.updateAssignmentStatus(user.userId, assignmentId, dto);
    }
};
exports.CraftsmenController = CraftsmenController;
__decorate([
    (0, common_1.Post)('craftsmen/profile'),
    (0, roles_decorator_1.Roles)('craftsman'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upsert_profile_dto_1.UpsertProfileDto]),
    __metadata("design:returntype", void 0)
], CraftsmenController.prototype, "upsertProfile", null);
__decorate([
    (0, common_1.Get)('craftsmen/profile'),
    (0, roles_decorator_1.Roles)('craftsman'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CraftsmenController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Get)('craftsmen'),
    (0, roles_decorator_1.Roles)('contractor'),
    __param(0, (0, common_1.Query)('province')),
    __param(1, (0, common_1.Query)('district')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CraftsmenController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('craftsmen/my-assignments'),
    (0, roles_decorator_1.Roles)('craftsman'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CraftsmenController.prototype, "findMyAssignments", null);
__decorate([
    (0, common_1.Get)('craftsmen/:craftsmanId'),
    (0, roles_decorator_1.Roles)('contractor'),
    __param(0, (0, common_1.Param)('craftsmanId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CraftsmenController.prototype, "getProfileDetail", null);
__decorate([
    (0, common_1.Post)('craftsmen/packages'),
    (0, roles_decorator_1.Roles)('craftsman'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_package_dto_1.CreatePackageDto]),
    __metadata("design:returntype", void 0)
], CraftsmenController.prototype, "createPackage", null);
__decorate([
    (0, common_1.Post)('craftsmen/packages/:packageId/items'),
    (0, roles_decorator_1.Roles)('craftsman'),
    __param(0, (0, common_1.Param)('packageId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_package_item_dto_1.CreatePackageItemDto]),
    __metadata("design:returntype", void 0)
], CraftsmenController.prototype, "addPackageItem", null);
__decorate([
    (0, common_1.Post)('craftsmen/portfolio'),
    (0, roles_decorator_1.Roles)('craftsman'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, add_portfolio_image_dto_1.AddPortfolioImageDto]),
    __metadata("design:returntype", void 0)
], CraftsmenController.prototype, "addPortfolioImage", null);
__decorate([
    (0, common_1.Post)('craftsmen/reviews'),
    (0, roles_decorator_1.Roles)('contractor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_review_dto_1.CreateReviewDto]),
    __metadata("design:returntype", void 0)
], CraftsmenController.prototype, "createReview", null);
__decorate([
    (0, common_1.Post)('projects/:projectId/assignments'),
    (0, roles_decorator_1.Roles)('contractor'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_assignment_dto_1.CreateAssignmentDto]),
    __metadata("design:returntype", void 0)
], CraftsmenController.prototype, "createAssignment", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/assignments'),
    (0, roles_decorator_1.Roles)('contractor'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CraftsmenController.prototype, "findAssignmentsByProject", null);
__decorate([
    (0, common_1.Patch)('assignments/:assignmentId/status'),
    (0, roles_decorator_1.Roles)('contractor'),
    __param(0, (0, common_1.Param)('assignmentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_assignment_status_dto_1.UpdateAssignmentStatusDto]),
    __metadata("design:returntype", void 0)
], CraftsmenController.prototype, "updateAssignmentStatus", null);
exports.CraftsmenController = CraftsmenController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [craftsmen_service_1.CraftsmenService])
], CraftsmenController);
//# sourceMappingURL=craftsmen.controller.js.map