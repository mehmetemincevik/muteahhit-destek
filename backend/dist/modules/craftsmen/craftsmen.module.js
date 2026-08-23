"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CraftsmenModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const craftsman_profile_entity_1 = require("./entities/craftsman-profile.entity");
const craftsman_service_package_entity_1 = require("./entities/craftsman-service-package.entity");
const service_package_item_entity_1 = require("./entities/service-package-item.entity");
const craftsman_portfolio_image_entity_1 = require("./entities/craftsman-portfolio-image.entity");
const craftsman_review_entity_1 = require("./entities/craftsman-review.entity");
const project_craftsman_assignment_entity_1 = require("./entities/project-craftsman-assignment.entity");
const craftsmen_service_1 = require("./craftsmen.service");
const craftsmen_controller_1 = require("./craftsmen.controller");
const projects_module_1 = require("../projects/projects.module");
let CraftsmenModule = class CraftsmenModule {
};
exports.CraftsmenModule = CraftsmenModule;
exports.CraftsmenModule = CraftsmenModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                craftsman_profile_entity_1.CraftsmanProfile,
                craftsman_service_package_entity_1.CraftsmanServicePackage,
                service_package_item_entity_1.ServicePackageItem,
                craftsman_portfolio_image_entity_1.CraftsmanPortfolioImage,
                craftsman_review_entity_1.CraftsmanReview,
                project_craftsman_assignment_entity_1.ProjectCraftsmanAssignment,
            ]),
            projects_module_1.ProjectsModule,
        ],
        controllers: [craftsmen_controller_1.CraftsmenController],
        providers: [craftsmen_service_1.CraftsmenService],
        exports: [craftsmen_service_1.CraftsmenService],
    })
], CraftsmenModule);
//# sourceMappingURL=craftsmen.module.js.map