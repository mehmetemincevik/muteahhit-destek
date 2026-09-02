"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsSchema1700000000001 = void 0;
class PaymentsSchema1700000000001 {
    constructor() {
        this.name = 'PaymentsSchema1700000000001';
    }
    async up(queryRunner) {
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
    async down(queryRunner) {
        throw new Error('down() tanımlı değil; geri alma elle yapılmalıdır.');
    }
}
exports.PaymentsSchema1700000000001 = PaymentsSchema1700000000001;
//# sourceMappingURL=1700000000001-PaymentsSchema.js.map