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
exports.Offer = exports.OfferStatus = exports.OfferSenderRole = void 0;
const typeorm_1 = require("typeorm");
const message_entity_1 = require("./message.entity");
const conversation_entity_1 = require("./conversation.entity");
const craftsman_service_package_entity_1 = require("../../craftsmen/entities/craftsman-service-package.entity");
var OfferSenderRole;
(function (OfferSenderRole) {
    OfferSenderRole["CONTRACTOR"] = "contractor";
    OfferSenderRole["CRAFTSMAN"] = "craftsman";
})(OfferSenderRole || (exports.OfferSenderRole = OfferSenderRole = {}));
var OfferStatus;
(function (OfferStatus) {
    OfferStatus["PENDING"] = "pending";
    OfferStatus["ACCEPTED"] = "accepted";
    OfferStatus["REJECTED"] = "rejected";
    OfferStatus["COUNTERED"] = "countered";
})(OfferStatus || (exports.OfferStatus = OfferStatus = {}));
let Offer = class Offer {
};
exports.Offer = Offer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Offer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'message_id', type: 'uuid', unique: true }),
    __metadata("design:type", String)
], Offer.prototype, "messageId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => message_entity_1.Message),
    (0, typeorm_1.JoinColumn)({ name: 'message_id' }),
    __metadata("design:type", message_entity_1.Message)
], Offer.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conversation_id', type: 'uuid' }),
    __metadata("design:type", String)
], Offer.prototype, "conversationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => conversation_entity_1.Conversation),
    (0, typeorm_1.JoinColumn)({ name: 'conversation_id' }),
    __metadata("design:type", conversation_entity_1.Conversation)
], Offer.prototype, "conversation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sender_role', type: 'varchar', length: 15 }),
    __metadata("design:type", String)
], Offer.prototype, "senderRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'package_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Offer.prototype, "packageId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => craftsman_service_package_entity_1.CraftsmanServicePackage, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'package_id' }),
    __metadata("design:type", craftsman_service_package_entity_1.CraftsmanServicePackage)
], Offer.prototype, "package", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], Offer.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Offer.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: OfferStatus.PENDING }),
    __metadata("design:type", String)
], Offer.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'counters_offer_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Offer.prototype, "countersOfferId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Offer, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'counters_offer_id' }),
    __metadata("design:type", Offer)
], Offer.prototype, "countersOffer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'responded_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Offer.prototype, "respondedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Offer.prototype, "createdAt", void 0);
exports.Offer = Offer = __decorate([
    (0, typeorm_1.Entity)('offers')
], Offer);
//# sourceMappingURL=offer.entity.js.map