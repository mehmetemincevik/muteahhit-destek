import { MigrationInterface, QueryRunner } from 'typeorm';

// Bu migration, 03_costs.sql dosyasındaki şemayı olduğu gibi uygular.
// Kaynak: proje planlama sürecinde birlikte tasarlanan 03_costs.sql
export class CostsSchema1700000000002 implements MigrationInterface {
  name = 'CostsSchema1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
-- ============================================
-- MODÜL 3: MALİYET KALEMLERİ (Proje Geneline Ait, Esnek Yapı)
-- ============================================

-- Kalem kategorileri: kullanıcı özgürce yeni kategori ekleyebilir
-- Örn: "Beton", "Demir", "Elektrik Malzeme", "İşçilik - Alçı", "Yol Katılım Payı"
CREATE TABLE cost_categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    cost_type       VARCHAR(20) NOT NULL CHECK (cost_type IN ('fixed', 'variable')),
        -- fixed: statik maliyet (arsa bedeli, ruhsat harcı gibi tek seferlik/sabit)
        -- variable: değişken maliyet (malzeme fiyatı piyasaya göre dalgalanan)
    is_system_default BOOLEAN NOT NULL DEFAULT false,  -- hazır şablon mu, kullanıcı mı ekledi
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Asıl maliyet kalemi kayıtları — her biri bir projeye, bir kategoriye bağlı
CREATE TABLE cost_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    category_id     UUID NOT NULL REFERENCES cost_categories(id),

    name            VARCHAR(200) NOT NULL,          -- "C25 Beton", "S420 Demir" gibi
    quantity        NUMERIC(14,3),                   -- miktar (m³, ton, m² vb.)
    unit            VARCHAR(20),                      -- "m³", "ton", "m²", "adet"
    unit_price      NUMERIC(14,2),                     -- birim fiyat
    total_cost      NUMERIC(14,2) NOT NULL,            -- toplam (quantity * unit_price veya direkt girilen)

    -- Mimari/statik projeden mi geldi, yoksa elle mi eklendi
    source          VARCHAR(20) NOT NULL DEFAULT 'manual'
                        CHECK (source IN ('manual', 'architectural_project', 'static_project')),

    -- Malzeme sınıfı bilgisi (demir S420 gibi) genel amaçlı JSON alanda tutulur,
    -- her malzeme türü farklı özellik istediği için sabit kolon yerine esnek alan kullanıyoruz
    extra_specs     JSONB,   -- örn: {"malzeme_sinifi": "S420", "kat": "Zemin"}

    incurred_date    DATE,   -- maliyetin oluştuğu/ödendiği tarih
    -- NOT: is_paid kaldırıldı -- cost_items KISMİ ÖDENEBİLİR (örn. demir siparişine önce avans,
    -- sonra kalan). Ödeme durumu artık aşağıdaki cost_payments tablosundan hesaplanır
    -- (units/payments ile tamamen aynı mantık: bkz. cost_payment_summary view).
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bir maliyet kalemine yapılan her ödeme (avans, ara ödeme, kapanış ödemesi) bir satır.
-- payments tablosuyla birebir aynı mantık, sadece units yerine cost_items'a bağlı.
CREATE TABLE cost_payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cost_item_id    UUID NOT NULL REFERENCES cost_items(id) ON DELETE CASCADE,
    amount          NUMERIC(14,2) NOT NULL,
    payment_date    DATE NOT NULL,
    payment_method  VARCHAR(30) CHECK (payment_method IN ('cash', 'bank_transfer', 'check', 'other')),
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()

    -- Her cost_payments kaydı oluştuğunda otomatik olarak asset_transactions'a
    -- transaction_type='cost_payment' (negatif tutar -- çıkış), source_table='cost_payments'
    -- ile bir satır düşer (payments ile aynı otomasyon mantığı).
);

-- Maliyet kalemi bazında ödeme özeti (units.unit_payment_summary ile birebir aynı desen)
CREATE VIEW cost_item_payment_summary AS
SELECT
    ci.id AS cost_item_id,
    ci.total_cost,
    COALESCE(SUM(cp.amount), 0) AS total_paid,
    ci.total_cost - COALESCE(SUM(cp.amount), 0) AS remaining_balance,
    (ci.total_cost - COALESCE(SUM(cp.amount), 0)) <= 0 AS is_fully_paid
FROM cost_items ci
LEFT JOIN cost_payments cp ON cp.cost_item_id = ci.id
GROUP BY ci.id, ci.total_cost;

-- Proje toplam maliyet özeti için view
CREATE VIEW project_cost_summary AS
SELECT
    ci.project_id,
    cc.cost_type,
    cc.name AS category_name,
    SUM(ci.total_cost) AS category_total
FROM cost_items ci
JOIN cost_categories cc ON cc.id = ci.category_id
GROUP BY ci.project_id, cc.cost_type, cc.name;

    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // NOT: down() metotları elle doldurulmalı (geri alma sırası ileri sıranın tersi olmalı,
    // foreign key bağımlılıkları nedeniyle DROP TABLE sırası önemli). MVP aşamasında geri
    // alma senaryosu genelde gerekmez, ama production'a geçmeden önce doldurulması önerilir.
    throw new Error('Bu migration için down() henüz yazılmadı -- elle geri almanız gerekir.');
  }
}
