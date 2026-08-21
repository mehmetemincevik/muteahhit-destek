import { MigrationInterface, QueryRunner } from 'typeorm';

// Bu migration, 02_payments.sql dosyasındaki şemayı olduğu gibi uygular.
// Kaynak: proje planlama sürecinde birlikte tasarlanan 02_payments.sql
export class PaymentsSchema1700000000001 implements MigrationInterface {
  name = 'PaymentsSchema1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
-- ============================================
-- MODÜL 2: ÖDEMELER (Parçalı/Tek Seferlik Tahsilat)
-- ============================================

-- Bir daire için gelen her ödeme bir satır.
-- Tek seferlik ödeme = tek satırlık kayıt. Parçalı ödeme = birden çok satır.
-- Bakiye HER ZAMAN hesaplanır: units.sale_price - SUM(payments.amount WHERE unit_id = X)
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id         UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    amount          NUMERIC(14,2) NOT NULL,
    payment_date    DATE NOT NULL,
    payment_method  VARCHAR(30) CHECK (payment_method IN ('cash', 'bank_transfer', 'check', 'other')),
    note            TEXT,

    -- NOT: eskiden burada 'reflected_to_assets' boolean alanı vardı, kaldırıldı.
    -- Artık her payments kaydı, oluşturulduğunda otomatik olarak asset_transactions'a
    -- transaction_type='unit_sale_payment', source_table='payments', source_id=payments.id
    -- ile bir satır düşürür. Yansıma durumu asset_transactions'ta zaten var olup olmamasıyla anlaşılır.

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hızlı bakiye sorgusu için view (tablo değil, hesaplanan görünüm)
CREATE VIEW unit_payment_summary AS
SELECT
    u.id AS unit_id,
    u.sale_price,
    COALESCE(SUM(p.amount), 0) AS total_paid,
    u.sale_price - COALESCE(SUM(p.amount), 0) AS remaining_balance,
    COUNT(p.id) AS payment_count
FROM units u
LEFT JOIN payments p ON p.unit_id = u.id
GROUP BY u.id, u.sale_price;

    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // NOT: down() metotları elle doldurulmalı (geri alma sırası ileri sıranın tersi olmalı,
    // foreign key bağımlılıkları nedeniyle DROP TABLE sırası önemli). MVP aşamasında geri
    // alma senaryosu genelde gerekmez, ama production'a geçmeden önce doldurulması önerilir.
    throw new Error('Bu migration için down() henüz yazılmadı -- elle geri almanız gerekir.');
  }
}
