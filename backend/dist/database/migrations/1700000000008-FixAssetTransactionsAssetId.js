"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixAssetTransactionsAssetId1700000000008 = void 0;
class FixAssetTransactionsAssetId1700000000008 {
    constructor() {
        this.name = 'FixAssetTransactionsAssetId1700000000008';
    }
    async up(queryRunner) {
        await queryRunner.query(`
-- DÜZELTME: asset_transactions tablosunda asset_id eksikti (04_assets.sql ilk yazıldığında
-- IF NOT EXISTS ile yazıldı: hem daha önce migration çalıştırılmış
-- olan (asset_id'siz) veritabanlarında hem de sıfırdan kurulacak (04_assets.sql güncellenmiş
-- haliyle, asset_id zaten dahil) veritabanlarında hatasız çalışsın diye.
ALTER TABLE asset_transactions ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES assets(id);

    `);
    }
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE asset_transactions DROP COLUMN IF EXISTS asset_id');
    }
}
exports.FixAssetTransactionsAssetId1700000000008 = FixAssetTransactionsAssetId1700000000008;
//# sourceMappingURL=1700000000008-FixAssetTransactionsAssetId.js.map