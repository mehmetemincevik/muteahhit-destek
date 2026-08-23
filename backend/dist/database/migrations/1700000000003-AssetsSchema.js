"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsSchema1700000000003 = void 0;
class AssetsSchema1700000000003 {
    constructor() {
        this.name = 'AssetsSchema1700000000003';
    }
    async up(queryRunner) {
        await queryRunner.query(`
-- ============================================
-- MODÜL 4: VARLIKLAR (Nakit, Emtia, Bağımsız Mülk) + KİRA
-- ============================================

-- Müteahhidin sahip olduğu tüm varlıklar (inşa ettiği projelerden BAĞIMSIZ)
CREATE TABLE assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id   UUID NOT NULL REFERENCES users(id),

    asset_type      VARCHAR(20) NOT NULL
                        CHECK (asset_type IN ('cash', 'commodity', 'real_estate', 'other')),

    name            VARCHAR(200) NOT NULL,      -- "Kadıköy 2+1 Daire", "22 Ayar Altın", "Nakit - Vakıfbank"
    description     TEXT,

    -- current_value ARTIK MANUEL GİRİLMİYOR: asset_transactions tablosundaki hareketlerin
    -- toplamından hesaplanıp bu alana senkronize edilir (trigger ile, aşağıda tanımlı).
    -- Kullanıcı dışarıdan gelen ödemeleri "manual_addition" tipiyle asset_transactions'a
    -- ekleyebilir, bu da otomatik olarak bakiyeye yansır.
    current_value   NUMERIC(14,2) NOT NULL DEFAULT 0,   -- CACHE ALANI -- asset_transactions'tan trigger ile güncellenir
    value_updated_at TIMESTAMPTZ,                 -- en son ne zaman güncellendi

    -- Sadece real_estate tipi için anlamlı alanlar (diğer tiplerde NULL kalır)
    province        VARCHAR(100),                 -- TCMB endeks bölgesi için
    district        VARCHAR(100),
    room_layout     VARCHAR(20),                   -- "3+1" gibi
    area_m2         NUMERIC(8,2),

    is_generating_rental_income BOOLEAN NOT NULL DEFAULT false,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bir mülk (real_estate tipi asset) kiraya verilmişse, kira bilgisi burada.
-- "Elde tutulan daire ile kira geliri bağımsız değil" mantığı: bu tablo asset'e FK ile bağlı,
-- yani kira her zaman belirli bir mülkün altında görünüyor, ayrı/kopuk bir kayıt değil.
CREATE TABLE asset_rentals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,

    tenant_name     VARCHAR(150),
    tenant_phone    VARCHAR(20),
    monthly_rent    NUMERIC(12,2) NOT NULL,
    contract_start_date DATE,
    contract_end_date   DATE,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    notes                TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gerçekte gelen her kira ödemesi (aylık tahsilat kaydı)
CREATE TABLE rental_payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_id       UUID NOT NULL REFERENCES asset_rentals(id) ON DELETE CASCADE,
    amount          NUMERIC(12,2) NOT NULL,
    payment_date    DATE NOT NULL,
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- real_estate tipi varlıklar için 6 aylık değer anlık görüntüsü (units.unit_value_snapshots ile
-- aynı mantık, tutarlılık için ayrı tablo -- assets units'ten bağımsız olduğu için birleştirmedik)
CREATE TABLE asset_value_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    estimated_value NUMERIC(14,2) NOT NULL,
    snapshot_date   DATE NOT NULL,
    source          VARCHAR(30) DEFAULT 'tcmb_index',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- current_value GÜNCELLEME MANTIĞI (uygulama katmanında veya trigger ile):
--
-- asset_type = 'cash' veya 'commodity'  -> current_value = SUM(asset_transactions.amount)
--                                          (bu asset_id için tüm hareketlerin toplamı)
-- asset_type = 'real_estate'             -> current_value = en son asset_value_snapshots kaydı
--                                          (TCMB endeks projeksiyonuna göre)
--
-- İki farklı kaynak olduğu için TEK bir trigger yerine iki ayrı trigger fonksiyonu kurulacak:
--   1) asset_transactions INSERT/UPDATE/DELETE sonrası -> ilgili cash/commodity asset'i güncelle
--   2) asset_value_snapshots INSERT sonrası            -> ilgili real_estate asset'i güncelle
-- ============================================


-- Tüm varlık hareketlerinin (para girişi/çıkışı) tek merkezi log'u.
-- Önceki gözden geçirmede payments.reflected_to_assets alanının kırılgan olduğunu belirtmiştik --
-- bunun yerine her hareketi burada topluyoruz (n8n bu tabloyu dinleyip Excel'e yazacak).
CREATE TABLE asset_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id   UUID NOT NULL REFERENCES users(id),

    transaction_type VARCHAR(30) NOT NULL
                        CHECK (transaction_type IN (
                            'unit_sale_payment',    -- units.payments'tan gelen tahsilat
                            'rental_income',         -- rental_payments'tan gelen kira
                            'manual_addition',        -- elle eklenen (nakit/emtia girişi)
                            'manual_deduction',        -- elle eklenen çıkış
                            'cost_payment'              -- maliyet kalemi ödemesi (çıkış)
                        )),

    amount          NUMERIC(14,2) NOT NULL,   -- pozitif: giriş, negatif: çıkış
    -- Kaynak kayda referans (hangi tablodan geldiği) -- polymorphic olduğu için sadece id + tip tutuyoruz
    source_table    VARCHAR(30),               -- "payments", "rental_payments", "cost_items" vb.
    source_id       UUID,

    description     TEXT,
    transaction_date DATE NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

    `);
    }
    async down(queryRunner) {
        throw new Error('Bu migration için down() henüz yazılmadı -- elle geri almanız gerekir.');
    }
}
exports.AssetsSchema1700000000003 = AssetsSchema1700000000003;
//# sourceMappingURL=1700000000003-AssetsSchema.js.map