import { MigrationInterface, QueryRunner } from 'typeorm';

// Kaynak: schema/06_craftsmen.sql
export class CraftsmenSchema1700000000005 implements MigrationInterface {
  name = 'CraftsmenSchema1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
-- ============================================
-- MODÜL 6: USTA / TAŞERON (Profil, Hizmet Paketi, Portfolyo, Yorum)
-- ============================================

-- Usta profili -- users tablosundaki 'craftsman' rolüne 1-1 ek bilgi
CREATE TABLE craftsman_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name        VARCHAR(200),                -- firma adıysa (bireysel usta boş bırakabilir)
    specialty_summary   VARCHAR(300),                 -- "Alçı-Sıva-Astar Ustası" gibi kısa özet
    province             VARCHAR(100),
    district              VARCHAR(100),
    years_of_experience    INT,
    bio                     TEXT,
    average_rating           NUMERIC(3,2) DEFAULT 0,     -- CACHE alanı -- reviews'tan hesaplanır
    review_count              INT DEFAULT 0,               -- CACHE alanı
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hizmet paketleri: usta ÖZGÜRCE kendi paketini oluşturabiliyor (sabit şablon şart değil).
-- Hazır şablonlar service_package_templates tablosunda tutulur; usta şablondan başlayıp
-- düzenleyebilir ya da sıfırdan kendi paketini kurabilir.
CREATE TABLE craftsman_service_packages (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    craftsman_id         UUID NOT NULL REFERENCES craftsman_profiles(id) ON DELETE CASCADE,

    -- Şablondan türetildiyse kaynak şablon referansı
    template_id            UUID,                       -- FK service_package_templates ile birlikte eklenir

    name                    VARCHAR(200) NOT NULL,       -- "Alçı-Sıva-Astar Paketi", "Su-Doğalgaz-Elektrik Paketi"
    description               TEXT,
    price_type                VARCHAR(20) CHECK (price_type IN ('per_m2', 'fixed', 'negotiable')),
    price_amount                NUMERIC(12,2),             -- price_type'a göre birim veya sabit fiyat
    is_active                    BOOLEAN NOT NULL DEFAULT true,
    created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bir paketin içerdiği alt hizmetler (örn "Su-Doğalgaz-Elektrik" paketi 3 alt kalemden oluşur)
-- Her alt kalemin KENDİ fiyatı var. Üst paketin price_amount alanı bu durumda ya boş kalır
-- ya da tüm alt kalemlerin toplamını gösteren bir özet/cache değeri olarak kullanılır.
CREATE TABLE service_package_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id      UUID NOT NULL REFERENCES craftsman_service_packages(id) ON DELETE CASCADE,
    item_name       VARCHAR(150) NOT NULL,        -- "Su Tesisatı", "Doğalgaz Tesisatı", "Elektrik Tesisatı"
    price_type      VARCHAR(20) CHECK (price_type IN ('per_m2', 'fixed', 'negotiable')),
    price_amount    NUMERIC(12,2),                  -- bu alt kalemin kendi fiyatı
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Portfolyo görselleri (yaptığı işlerin fotoğrafları)
CREATE TABLE craftsman_portfolio_images (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    craftsman_id    UUID NOT NULL REFERENCES craftsman_profiles(id) ON DELETE CASCADE,
    package_id      UUID REFERENCES craftsman_service_packages(id),  -- opsiyonel: hangi hizmete ait
    image_url        TEXT NOT NULL,                -- obje depolama (S3/R2/MinIO) linki
    caption            VARCHAR(300),
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Yorum/puan sistemi -- müteahhit ustayı değerlendiriyor
CREATE TABLE craftsman_reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    craftsman_id    UUID NOT NULL REFERENCES craftsman_profiles(id) ON DELETE CASCADE,
    contractor_id   UUID NOT NULL REFERENCES users(id),
    project_id       UUID REFERENCES projects(id),   -- hangi projede çalıştıkları (opsiyonel bağlam)

    rating            SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment             TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (craftsman_id, contractor_id, project_id)  -- aynı projede aynı müteahhit ikinci kez oy veremez
);

-- ============================================
-- CACHE GÜNCELLEME: craftsman_profiles.average_rating ve review_count,
-- craftsman_reviews üzerinde INSERT/UPDATE/DELETE sonrası trigger ile yeniden hesaplanır.
-- craftsman_service_packages.price_amount da (paket toplu fiyatı varsa) service_package_items
-- toplamından hesaplanan bir CACHE değeri olarak kullanılabilir.
-- ============================================

-- Ustanın bir projedeki görevlendirmesi. Teklif kabul edildiğinde burada
-- otomatik bir kayıt oluşur.
CREATE TABLE project_craftsman_assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    craftsman_id    UUID NOT NULL REFERENCES craftsman_profiles(id),
    package_id      UUID REFERENCES craftsman_service_packages(id),  -- hangi hizmet paketiyle çalışıyor

    agreed_price     NUMERIC(14,2),                -- anlaşılan toplam bedel
    status             VARCHAR(20) NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'completed', 'cancelled')),
    start_date           DATE,
    end_date               DATE,
    notes                   TEXT,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // TODO: Geri alma yazılmadı. DROP sırası foreign key bağımlılıklarının tersi olmalı.
    throw new Error('down() tanımlı değil; geri alma elle yapılmalıdır.');
  }
}
