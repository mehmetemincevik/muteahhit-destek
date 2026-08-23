"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const asset_entity_1 = require("./entities/asset.entity");
const asset_rental_entity_1 = require("./entities/asset-rental.entity");
const rental_payment_entity_1 = require("./entities/rental-payment.entity");
const asset_value_snapshot_entity_1 = require("./entities/asset-value-snapshot.entity");
const asset_transaction_entity_1 = require("./entities/asset-transaction.entity");
const assets_service_1 = require("./assets.service");
const assets_controller_1 = require("./assets.controller");
let AssetsModule = class AssetsModule {
};
exports.AssetsModule = AssetsModule;
exports.AssetsModule = AssetsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([asset_entity_1.Asset, asset_rental_entity_1.AssetRental, rental_payment_entity_1.RentalPayment, asset_value_snapshot_entity_1.AssetValueSnapshot, asset_transaction_entity_1.AssetTransaction]),
        ],
        controllers: [assets_controller_1.AssetsController, assets_controller_1.RentalsController],
        providers: [assets_service_1.AssetsService],
        exports: [assets_service_1.AssetsService],
    })
], AssetsModule);
//# sourceMappingURL=assets.module.js.map