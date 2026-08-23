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
exports.CraftsmanPortfolioImage = void 0;
const typeorm_1 = require("typeorm");
const craftsman_profile_entity_1 = require("./craftsman-profile.entity");
const craftsman_service_package_entity_1 = require("./craftsman-service-package.entity");
let CraftsmanPortfolioImage = class CraftsmanPortfolioImage {
};
exports.CraftsmanPortfolioImage = CraftsmanPortfolioImage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CraftsmanPortfolioImage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'craftsman_id', type: 'uuid' }),
    __metadata("design:type", String)
], CraftsmanPortfolioImage.prototype, "craftsmanId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => craftsman_profile_entity_1.CraftsmanProfile),
    (0, typeorm_1.JoinColumn)({ name: 'craftsman_id' }),
    __metadata("design:type", craftsman_profile_entity_1.CraftsmanProfile)
], CraftsmanPortfolioImage.prototype, "craftsman", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'package_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CraftsmanPortfolioImage.prototype, "packageId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => craftsman_service_package_entity_1.CraftsmanServicePackage, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'package_id' }),
    __metadata("design:type", craftsman_service_package_entity_1.CraftsmanServicePackage)
], CraftsmanPortfolioImage.prototype, "package", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'image_url', type: 'text' }),
    __metadata("design:type", String)
], CraftsmanPortfolioImage.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 300, nullable: true }),
    __metadata("design:type", String)
], CraftsmanPortfolioImage.prototype, "caption", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'uploaded_at' }),
    __metadata("design:type", Date)
], CraftsmanPortfolioImage.prototype, "uploadedAt", void 0);
exports.CraftsmanPortfolioImage = CraftsmanPortfolioImage = __decorate([
    (0, typeorm_1.Entity)('craftsman_portfolio_images')
], CraftsmanPortfolioImage);
//# sourceMappingURL=craftsman-portfolio-image.entity.js.map