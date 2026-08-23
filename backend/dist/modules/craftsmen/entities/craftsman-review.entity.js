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
exports.CraftsmanReview = void 0;
const typeorm_1 = require("typeorm");
const craftsman_profile_entity_1 = require("./craftsman-profile.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const project_entity_1 = require("../../projects/entities/project.entity");
let CraftsmanReview = class CraftsmanReview {
};
exports.CraftsmanReview = CraftsmanReview;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CraftsmanReview.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'craftsman_id', type: 'uuid' }),
    __metadata("design:type", String)
], CraftsmanReview.prototype, "craftsmanId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => craftsman_profile_entity_1.CraftsmanProfile),
    (0, typeorm_1.JoinColumn)({ name: 'craftsman_id' }),
    __metadata("design:type", craftsman_profile_entity_1.CraftsmanProfile)
], CraftsmanReview.prototype, "craftsman", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contractor_id', type: 'uuid' }),
    __metadata("design:type", String)
], CraftsmanReview.prototype, "contractorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'contractor_id' }),
    __metadata("design:type", user_entity_1.User)
], CraftsmanReview.prototype, "contractor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CraftsmanReview.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], CraftsmanReview.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint' }),
    __metadata("design:type", Number)
], CraftsmanReview.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CraftsmanReview.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CraftsmanReview.prototype, "createdAt", void 0);
exports.CraftsmanReview = CraftsmanReview = __decorate([
    (0, typeorm_1.Entity)('craftsman_reviews'),
    (0, typeorm_1.Unique)(['craftsmanId', 'contractorId', 'projectId'])
], CraftsmanReview);
//# sourceMappingURL=craftsman-review.entity.js.map