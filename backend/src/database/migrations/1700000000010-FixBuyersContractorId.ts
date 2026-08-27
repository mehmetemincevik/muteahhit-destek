import { MigrationInterface, QueryRunner } from 'typeorm';

// Düzeltme: buyers tablosuna contractor_id ekler (alıcılar artık müteahhide özel).
// Kaynak: 11_fix_buyers_contractor_id.sql
export class FixBuyersContractorId1700000000010 implements MigrationInterface {
  name = 'FixBuyersContractorId1700000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE buyers DROP COLUMN IF EXISTS contractor_id');
  }
}
