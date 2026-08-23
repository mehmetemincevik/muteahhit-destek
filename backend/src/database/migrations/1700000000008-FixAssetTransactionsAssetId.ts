import { MigrationInterface, QueryRunner } from 'typeorm';

// Düzeltme: asset_transactions tablosunda eksik kalan asset_id sütununu ekler.
// Kaynak: 09_fix_asset_transactions_asset_id.sql
export class FixAssetTransactionsAssetId1700000000008 implements MigrationInterface {
  name = 'FixAssetTransactionsAssetId1700000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
-- DÜZELTME: asset_transactions tablosunda asset_id eksikti (04_assets.sql ilk yazıldığında
-- gözden kaçmıştı). IF NOT EXISTS kullanıyoruz çünkü bu hem daha önce migration'ları çalıştırmış
-- olan (asset_id'siz) veritabanlarında hem de sıfırdan kurulacak (04_assets.sql güncellenmiş
-- haliyle, asset_id zaten dahil) veritabanlarında hatasız çalışsın diye.
ALTER TABLE asset_transactions ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES assets(id);

    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE asset_transactions DROP COLUMN IF EXISTS asset_id');
  }
}
