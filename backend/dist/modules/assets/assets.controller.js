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
exports.RentalsController = exports.AssetsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const assets_service_1 = require("./assets.service");
const create_asset_dto_1 = require("./dto/create-asset.dto");
const create_manual_transaction_dto_1 = require("./dto/create-manual-transaction.dto");
const create_rental_dto_1 = require("./dto/create-rental.dto");
const create_rental_payment_dto_1 = require("./dto/create-rental-payment.dto");
const create_value_snapshot_dto_1 = require("./dto/create-value-snapshot.dto");
let AssetsController = class AssetsController {
    constructor(assetsService) {
        this.assetsService = assetsService;
    }
    create(user, dto) {
        return this.assetsService.createAsset(user.userId, dto);
    }
    findAll(user) {
        return this.assetsService.findAssetsForContractor(user.userId);
    }
    findOne(assetId, user) {
        return this.assetsService.getAssetDetail(user.userId, assetId);
    }
    addManualTransaction(assetId, user, dto) {
        return this.assetsService.addManualTransaction(user.userId, assetId, dto);
    }
    createRental(assetId, user, dto) {
        return this.assetsService.createRental(user.userId, assetId, dto);
    }
    addValueSnapshot(assetId, user, dto) {
        return this.assetsService.addValueSnapshot(user.userId, assetId, dto);
    }
};
exports.AssetsController = AssetsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_asset_dto_1.CreateAssetDto]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':assetId'),
    __param(0, (0, common_1.Param)('assetId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':assetId/transactions'),
    __param(0, (0, common_1.Param)('assetId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_manual_transaction_dto_1.CreateManualTransactionDto]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "addManualTransaction", null);
__decorate([
    (0, common_1.Post)(':assetId/rentals'),
    __param(0, (0, common_1.Param)('assetId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_rental_dto_1.CreateRentalDto]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "createRental", null);
__decorate([
    (0, common_1.Post)(':assetId/value-snapshots'),
    __param(0, (0, common_1.Param)('assetId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_value_snapshot_dto_1.CreateValueSnapshotDto]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "addValueSnapshot", null);
exports.AssetsController = AssetsController = __decorate([
    (0, common_1.Controller)('assets'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [assets_service_1.AssetsService])
], AssetsController);
let RentalsController = class RentalsController {
    constructor(assetsService) {
        this.assetsService = assetsService;
    }
    addPayment(rentalId, user, dto) {
        return this.assetsService.addRentalPayment(user.userId, rentalId, dto);
    }
};
exports.RentalsController = RentalsController;
__decorate([
    (0, common_1.Post)(':rentalId/payments'),
    __param(0, (0, common_1.Param)('rentalId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_rental_payment_dto_1.CreateRentalPaymentDto]),
    __metadata("design:returntype", void 0)
], RentalsController.prototype, "addPayment", null);
exports.RentalsController = RentalsController = __decorate([
    (0, common_1.Controller)('rentals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [assets_service_1.AssetsService])
], RentalsController);
//# sourceMappingURL=assets.controller.js.map