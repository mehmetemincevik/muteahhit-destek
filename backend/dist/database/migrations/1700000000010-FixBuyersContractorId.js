"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixBuyersContractorId1700000000010 = void 0;
class FixBuyersContractorId1700000000010 {
    constructor() {
        this.name = 'FixBuyersContractorId1700000000010';
    }
    async up(queryRunner) {
        await queryRunner.query(`
-- ============================================
-- DÜZELTME: buyers tablosunda contractor_id eksikti.
-- Bu olmadan alıcılar "global" oluyordu -- bir müteahhit, başka bir müteahhidin
-- alıcı listesini (ad, telefon, TC kimlik, adres gibi KİŞİSEL VERİLERİ) görebilirdi.
-- Alıcılar artık her zaman bir müteahhide ait.
-- ============================================

ALTER TABLE buyers ADD COLUMN IF NOT EXISTS contractor_id UUID REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_buyers_contractor_id ON buyers(contractor_id);

    `);
    }
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE buyers DROP COLUMN IF EXISTS contractor_id');
    }
}
exports.FixBuyersContractorId1700000000010 = FixBuyersContractorId1700000000010;
//# sourceMappingURL=1700000000010-FixBuyersContractorId.js.map