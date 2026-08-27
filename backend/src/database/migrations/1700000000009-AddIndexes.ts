import { MigrationInterface, QueryRunner } from 'typeorm';

// Production hazırlığı: tüm foreign key'lere ve sık sorgulanan alanlara indeks ekler.
// Kaynak: 10_add_indexes.sql
export class AddIndexes1700000000009 implements MigrationInterface {
  name = 'AddIndexes1700000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
-- ============================================
-- PRODUCTION HAZIRLIĞI: İNDEKSLER
-- Postgres, foreign key sütunlarına OTOMATİK indeks eklemez (sadece primary key ve
-- UNIQUE kısıtlamalarına ekler). Bu, ilişkili tablolar büyüdükçe (örn. binlerce ödeme
-- kaydı) JOIN ve WHERE sorgularının YAVAŞLAMASINA yol açar. Bu migration, tüm foreign
-- key'lere ve sık filtrelenen alanlara indeks ekler.
-- IF NOT EXISTS kullanıyoruz -- güvenli şekilde tekrar çalıştırılabilir.
-- ============================================

-- Modül 1: Core
CREATE INDEX IF NOT EXISTS idx_projects_contractor_id ON projects(contractor_id);
CREATE INDEX IF NOT EXISTS idx_land_owners_land_id ON land_owners(land_id);
CREATE INDEX IF NOT EXISTS idx_blocks_project_id ON blocks(project_id);
CREATE INDEX IF NOT EXISTS idx_units_block_id ON units(block_id);
CREATE INDEX IF NOT EXISTS idx_units_buyer_id ON units(buyer_id);
CREATE INDEX IF NOT EXISTS idx_units_land_owner_id ON units(land_owner_id);
CREATE INDEX IF NOT EXISTS idx_units_ownership_status ON units(ownership_status);
CREATE INDEX IF NOT EXISTS idx_unit_value_snapshots_unit_id ON unit_value_snapshots(unit_id);
CREATE INDEX IF NOT EXISTS idx_unit_adjustments_unit_id ON unit_adjustments(unit_id);

-- Modül 2: Ödemeler
CREATE INDEX IF NOT EXISTS idx_payments_unit_id ON payments(unit_id);

-- Modül 3: Maliyetler
CREATE INDEX IF NOT EXISTS idx_cost_items_project_id ON cost_items(project_id);
CREATE INDEX IF NOT EXISTS idx_cost_items_category_id ON cost_items(category_id);
CREATE INDEX IF NOT EXISTS idx_cost_payments_cost_item_id ON cost_payments(cost_item_id);

-- Modül 4: Varlıklar
CREATE INDEX IF NOT EXISTS idx_assets_contractor_id ON assets(contractor_id);
CREATE INDEX IF NOT EXISTS idx_asset_rentals_asset_id ON asset_rentals(asset_id);
CREATE INDEX IF NOT EXISTS idx_rental_payments_rental_id ON rental_payments(rental_id);
CREATE INDEX IF NOT EXISTS idx_asset_value_snapshots_asset_id ON asset_value_snapshots(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_transactions_contractor_id ON asset_transactions(contractor_id);
CREATE INDEX IF NOT EXISTS idx_asset_transactions_asset_id ON asset_transactions(asset_id);

-- Modül 5: Gelir-Gider Takvimi
CREATE INDEX IF NOT EXISTS idx_cashflow_calendar_contractor_id ON cashflow_calendar(contractor_id);
-- Günlük faiz işletme sorgusu HER GÜN bu iki alana göre filtreliyor (bkz. CashflowService.
-- runDailyAccrual) -- composite index bu sorguyu ciddi şekilde hızlandırır.
CREATE INDEX IF NOT EXISTS idx_cashflow_calendar_status_due_date ON cashflow_calendar(status, due_date);

-- Modül 6: Ustalar
CREATE INDEX IF NOT EXISTS idx_craftsman_service_packages_craftsman_id ON craftsman_service_packages(craftsman_id);
CREATE INDEX IF NOT EXISTS idx_craftsman_service_packages_template_id ON craftsman_service_packages(template_id);
CREATE INDEX IF NOT EXISTS idx_service_package_items_package_id ON service_package_items(package_id);
CREATE INDEX IF NOT EXISTS idx_craftsman_portfolio_images_craftsman_id ON craftsman_portfolio_images(craftsman_id);
CREATE INDEX IF NOT EXISTS idx_craftsman_reviews_contractor_id ON craftsman_reviews(contractor_id);
CREATE INDEX IF NOT EXISTS idx_craftsman_reviews_project_id ON craftsman_reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_project_craftsman_assignments_project_id ON project_craftsman_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_craftsman_assignments_craftsman_id ON project_craftsman_assignments(craftsman_id);

-- Modül 7: Mesajlaşma/Teklifler
CREATE INDEX IF NOT EXISTS idx_conversations_craftsman_id ON conversations(craftsman_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contractor_id ON conversations(contractor_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_offers_conversation_id ON offers(conversation_id);
CREATE INDEX IF NOT EXISTS idx_offers_counters_offer_id ON offers(counters_offer_id);

-- Modül 8: Şablonlar
CREATE INDEX IF NOT EXISTS idx_service_package_template_items_template_id ON service_package_template_items(template_id);

    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // İndeksleri kaldırmak nadiren gerekir, gerekirse elle DROP INDEX yazılabilir.
    throw new Error('Bu migration için down() yazılmadı -- gerekirse elle DROP INDEX kullanın.');
  }
}
