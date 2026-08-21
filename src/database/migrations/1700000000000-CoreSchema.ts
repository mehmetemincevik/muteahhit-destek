import { MigrationInterface, QueryRunner } from 'typeorm';

// Bu migration, 01_core.sql dosyasındaki şemayı olduğu gibi uygular.
// Kaynak: proje planlama sürecinde birlikte tasarlanan 01_core.sql
export class CoreSchema1700000000000 implements MigrationInterface {
  name = 'CoreSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
-- ============================================
-- MODÜL 1: KULLANICILAR VE TEMEL PROJE YAPISI
-- ============================================

-- Tüm kullanıcılar tek tabloda, rol ile ayrılıyor
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role            VARCHAR(20) NOT NULL CHECK (role IN ('contractor', 'craftsman')),
    full_name       VARCHAR(150) NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    email           VARCHAR(150),
    password_hash   TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bir proje = bir müteahhit + bir arsa (1-1 ilişki)
CREATE TABLE projects (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id       UUID NOT NULL REFERENCES users(id),
    name                VARCHAR(200) NOT NULL,           -- "Yeşiltepe Sitesi" gibi
    status              VARCHAR(30) NOT NULL DEFAULT 'planning'
                            CHECK (status IN ('planning', 'construction', 'completed', 'on_hold')),
    estimated_occupancy_date DATE,                        -- tahmini iskan tarihi (projeksiyon için)
    actual_occupancy_date    DATE,

    -- Usta keşfi için: müteahhit projeyi "açık ilan" gibi yayınlayabilir.
    -- ÖNEMLİ: is_public=true olsa bile ustaya SADECE sınırlı/tanıtıcı bilgiler gösterilir
    -- (isim, il/ilçe, durum, tahmini iskan tarihi). Arsa maliyeti, kat listesi satış fiyatları,
    -- varlıklar gibi finansal veriler asla ustaya açılmaz -- bu uygulama/API katmanında
    -- ayrı bir "public görünüm" endpoint'i ile zorlanmalı, ham tabloya erişim verilmemeli.
    is_public                 BOOLEAN NOT NULL DEFAULT false,
    public_note                 TEXT,     -- "İnce işler için usta aranıyor" gibi kısa açıklama, sadece is_public=true iken gösterilir

    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1 proje = 1 arsa
CREATE TABLE land (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id          UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
    province            VARCHAR(100),                     -- il (TCMB endeks bölgesi için önemli)
    district            VARCHAR(100),                      -- ilçe
    neighborhood        VARCHAR(150),                      -- mahalle
    ada_no              VARCHAR(30),                        -- ada no (manuel girilecek)
    parsel_no           VARCHAR(30),                        -- parsel no (manuel girilecek)
    area_m2             NUMERIC(12,2),                      -- arsa m²
    purchase_price       NUMERIC(14,2),                     -- arsa alım bedeli
    purchase_date        DATE,
    -- NOT: owner_name kaldırıldı -- arsa çok sahipli olabildiği için sahip bilgisi
    -- artık land_owners tablosunda tutuluyor (aşağıda tanımlı).
    is_kat_karsiligi     BOOLEAN NOT NULL DEFAULT false,      -- kat karşılığı mı, satın alma mı
    notes                TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ustaların göreceği kısıtlı "açık proje" görünümü -- finansal alanlar KASITLI OLARAK dahil değil
-- (land tablosundan SONRA tanımlanmalı, çünkü buna JOIN atıyor)
CREATE VIEW public_project_listings AS
SELECT
    p.id,
    p.name,
    p.status,
    p.estimated_occupancy_date,
    p.public_note,
    l.province,
    l.district
FROM projects p
LEFT JOIN land l ON l.project_id = p.id
WHERE p.is_public = true;

-- Arsa çok sahipli (hisseli tapu) olabilir -> ayrı tablo, çoktan-çoğa mantığıyla
CREATE TABLE land_owners (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    land_id         UUID NOT NULL REFERENCES land(id) ON DELETE CASCADE,
    full_name       VARCHAR(150) NOT NULL,
    phone           VARCHAR(20),
    share_percentage NUMERIC(5,2),         -- hisse oranı, örn 25.00 (%)
    tc_or_vkn        VARCHAR(20),           -- TC kimlik veya vergi kimlik no (opsiyonel)
    notes             TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (share_percentage >= 0 AND share_percentage <= 100)
);

-- Bir daire, kat karşılığında hangi arsa sahibine teslim edilecek/edildi -- bunu units'e değil
-- buraya bağlıyoruz çünkü units henüz tanımlanmadı; aşağıda units'ten sonra FK eklenecek.

-- Bloklar (bir projede birden fazla blok olabilir)
CREATE TABLE blocks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name            VARCHAR(50) NOT NULL,        -- "A Blok", "B Blok"
    floor_count     INT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Daireler — en kritik tablolardan biri
CREATE TABLE units (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_id            UUID NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    floor_no            INT NOT NULL,                          -- kaçıncı kat
    unit_no             VARCHAR(20) NOT NULL,                   -- daire no (örn "12")
    room_layout         VARCHAR(20),                            -- "3+1", "2+1" gibi
    gross_m2            NUMERIC(8,2),
    net_m2              NUMERIC(8,2),

    -- Durum: boşta / satıldı / arsa sahibine verildi -- ikisi aynı anda olabileceği için
    -- ayrı iki boolean + bağımsız fark ödeme mantığı kullanıyoruz (aşağıya bkz.)
    ownership_status    VARCHAR(30) NOT NULL DEFAULT 'available'
                            CHECK (ownership_status IN ('available', 'sold', 'given_to_land_owner')),

    sale_price           NUMERIC(14,2),                          -- topraktan satış fiyatı (varsa)
    estimated_sale_value NUMERIC(14,2),                          -- AI/endeks projeksiyonu ile hesaplanan GÜNCEL tahmini değer

    -- "sold" durumundaysa hangi alıcıya satıldığı; "given_to_land_owner" durumundaysa
    -- hangi arsa sahibine (land_owners) verildiği. İkisi birbirini dışladığı için
    -- ikisinden sadece biri dolu olur.
    buyer_id              UUID,                                    -- aşağıda FK eklenecek (buyers tablosu sonra tanımlanıyor)
    land_owner_id          UUID REFERENCES land_owners(id),

    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (block_id, unit_no),

    -- buyer_id ve land_owner_id, ownership_status ile tutarlı olmalı:
    -- 'sold' -> sadece buyer_id dolu olabilir; 'given_to_land_owner' -> sadece land_owner_id;
    -- 'available' -> ikisi de boş olmalı.
    CHECK (
        (ownership_status = 'sold' AND land_owner_id IS NULL)
        OR (ownership_status = 'given_to_land_owner' AND buyer_id IS NULL)
        OR (ownership_status = 'available' AND buyer_id IS NULL AND land_owner_id IS NULL)
    )
);

-- Daire alıcıları (uygulama içi kullanıcı değil, sadece bilgi kaydı)
CREATE TABLE buyers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(150) NOT NULL,
    phone           VARCHAR(20),
    email           VARCHAR(150),
    tc_or_vkn        VARCHAR(20),
    address           TEXT,
    notes             TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE units ADD CONSTRAINT fk_units_buyer
    FOREIGN KEY (buyer_id) REFERENCES buyers(id);

-- Dairenin tahmini değerinin 6 aylık anlık görüntüleri (son 12 ay = 2 kayıt hedefi)
-- Not: sistem her 6 ayda bir otomatik snapshot alacak şekilde n8n ile tetiklenebilir.
CREATE TABLE unit_value_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id         UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    estimated_value NUMERIC(14,2) NOT NULL,
    snapshot_date   DATE NOT NULL,               -- hangi tarihte alındığı
    source          VARCHAR(30) DEFAULT 'tcmb_index',  -- neye göre hesaplandığı
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fark ödeme: bir daire için üstüne alınacak veya verilecek ekstra para
-- "İkisi de aynı anda olabilir" dediğin için status'tan BAĞIMSIZ ayrı tablo yaptım.
-- Örn: daire arsa sahibine verildi AMA müteahhit üstüne 200.000 TL fark aldı.
CREATE TABLE unit_adjustments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id         UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    direction       VARCHAR(10) NOT NULL CHECK (direction IN ('receivable', 'payable')),
        -- receivable: müteahhit alacaklı (üstüne para alacak)
        -- payable: müteahhit borçlu (üstüne para verecek)
    amount          NUMERIC(14,2) NOT NULL,
    description     TEXT,                          -- "Ekstra izolasyon talebi" gibi açıklama
    is_settled       BOOLEAN NOT NULL DEFAULT false, -- ödendi mi/tahsil edildi mi
    settled_date       DATE,                          -- ne zaman ödendi/tahsil edildi
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()

    -- is_settled = true olarak işaretlendiğinde, otomatik olarak asset_transactions'a
    -- transaction_type='manual_addition' (receivable ise) veya 'manual_deduction' (payable ise),
    -- source_table='unit_adjustments' ile bir satır düşer.
);

    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // NOT: down() metotları elle doldurulmalı (geri alma sırası ileri sıranın tersi olmalı,
    // foreign key bağımlılıkları nedeniyle DROP TABLE sırası önemli). MVP aşamasında geri
    // alma senaryosu genelde gerekmez, ama production'a geçmeden önce doldurulması önerilir.
    throw new Error('Bu migration için down() henüz yazılmadı -- elle geri almanız gerekir.');
  }
}
