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
exports.ProjectCraftsmanAssignment = exports.AssignmentStatus = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("../../projects/entities/project.entity");
const craftsman_profile_entity_1 = require("./craftsman-profile.entity");
const craftsman_service_package_entity_1 = require("./craftsman-service-package.entity");
var AssignmentStatus;
(function (AssignmentStatus) {
    AssignmentStatus["ACTIVE"] = "active";
    AssignmentStatus["COMPLETED"] = "completed";
    AssignmentStatus["CANCELLED"] = "cancelled";
})(AssignmentStatus || (exports.AssignmentStatus = AssignmentStatus = {}));
let ProjectCraftsmanAssignment = class ProjectCraftsmanAssignment {
};
exports.ProjectCraftsmanAssignment = ProjectCraftsmanAssignment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProjectCraftsmanAssignment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id', type: 'uuid' }),
    __metadata("design:type", String)
], ProjectCraftsmanAssignment.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], ProjectCraftsmanAssignment.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'craftsman_id', type: 'uuid' }),
    __metadata("design:type", String)
], ProjectCraftsmanAssignment.prototype, "craftsmanId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => craftsman_profile_entity_1.CraftsmanProfile),
    (0, typeorm_1.JoinColumn)({ name: 'craftsman_id' }),
    __metadata("design:type", craftsman_profile_entity_1.CraftsmanProfile)
], ProjectCraftsmanAssignment.prototype, "craftsman", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'package_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ProjectCraftsmanAssignment.prototype, "packageId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => craftsman_service_package_entity_1.CraftsmanServicePackage, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'package_id' }),
    __metadata("design:type", craftsman_service_package_entity_1.CraftsmanServicePackage)
], ProjectCraftsmanAssignment.prototype, "package", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agreed_price', type: 'numeric', precision: 14, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ProjectCraftsmanAssignment.prototype, "agreedPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: AssignmentStatus.ACTIVE }),
    __metadata("design:type", String)
], ProjectCraftsmanAssignment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ProjectCraftsmanAssignment.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ProjectCraftsmanAssignment.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProjectCraftsmanAssignment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ProjectCraftsmanAssignment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ProjectCraftsmanAssignment.prototype, "updatedAt", void 0);
exports.ProjectCraftsmanAssignment = ProjectCraftsmanAssignment = __decorate([
    (0, typeorm_1.Entity)('project_craftsman_assignments')
], ProjectCraftsmanAssignment);
//# sourceMappingURL=project-craftsman-assignment.entity.js.map