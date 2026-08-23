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
exports.CraftsmanProfile = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let CraftsmanProfile = class CraftsmanProfile {
};
exports.CraftsmanProfile = CraftsmanProfile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CraftsmanProfile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid', unique: true }),
    __metadata("design:type", String)
], CraftsmanProfile.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], CraftsmanProfile.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_name', type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], CraftsmanProfile.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'specialty_summary', type: 'varchar', length: 300, nullable: true }),
    __metadata("design:type", String)
], CraftsmanProfile.prototype, "specialtySummary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], CraftsmanProfile.prototype, "province", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], CraftsmanProfile.prototype, "district", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'years_of_experience', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], CraftsmanProfile.prototype, "yearsOfExperience", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CraftsmanProfile.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'average_rating', type: 'numeric', precision: 3, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CraftsmanProfile.prototype, "averageRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'review_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CraftsmanProfile.prototype, "reviewCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CraftsmanProfile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CraftsmanProfile.prototype, "updatedAt", void 0);
exports.CraftsmanProfile = CraftsmanProfile = __decorate([
    (0, typeorm_1.Entity)('craftsman_profiles')
], CraftsmanProfile);
//# sourceMappingURL=craftsman-profile.entity.js.map