"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesSchema1700000000007 = void 0;
class TemplatesSchema1700000000007 {
    constructor() {
        this.name = 'TemplatesSchema1700000000007';
    }
    async up(queryRunner) {
        await queryRunner.query(`
-- ============================================
-- MODÜL 8: HAZIR HİZMET PAKETİ ŞABLONLARI
-- (Sistem tarafından sunulan, sektörde gerçekten kullanılan paketleme örnekleri)
-- ============================================

-- Şablon paketler -- usta bunlardan birini seçip kendi craftsman_service_packages
-- kaydını buradan türetebilir (fiyatları kendine göre girer), ya da hiç kullanmayıp
-- sıfırdan kendi paketini kurabilir (Modül 6'da zaten özgür bırakmıştık).
CREATE TABLE service_package_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    category        VARCHAR(50),        -- "Kaba İnşaat", "İnce İşler", "Tesisat" gibi üst gruplama
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Şablonun içerdiği alt kalemler (fiyatsız -- sadece yapısal referans, fiyatı usta kendi
-- service_package_items kaydında belirler)
CREATE TABLE service_package_template_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id     UUID NOT NULL REFERENCES service_package_templates(id) ON DELETE CASCADE,
    item_name       VARCHAR(150) NOT NULL,
    default_price_type VARCHAR(20) CHECK (default_price_type IN ('per_m2', 'fixed', 'negotiable')),
    display_order    INT DEFAULT 0,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Modül 6'da bırakılan template_id referansını şimdi bağlıyoruz
ALTER TABLE craftsman_service_packages ADD CONSTRAINT fk_package_template
    FOREIGN KEY (template_id) REFERENCES service_package_templates(id);

-- ============================================
-- ÖRNEK VERİ: Sektörde gerçekten kullanılan tipik paketleme (başlangıç seti)
-- ============================================

INSERT INTO service_package_templates (id, name, category, description) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Kaba İnşaat (Kalıp-Demir-Beton)', 'Kaba İnşaat', 'Temelden çatıya taşıyıcı sistem işleri'),
    ('a0000000-0000-0000-0000-000000000002', 'Sıva-Alçı-Astar', 'İnce İşler', 'Duvar ve tavan sıva, alçı, astar işleri'),
    ('a0000000-0000-0000-0000-000000000003', 'Su-Doğalgaz-Elektrik Tesisatı', 'Tesisat', 'Kombine mekanik ve elektrik tesisat paketi'),
    ('a0000000-0000-0000-0000-000000000004', 'Boya-Badana', 'İnce İşler', 'İç/dış cephe boya işleri'),
    ('a0000000-0000-0000-0000-000000000005', 'Seramik-Fayans-Zemin Kaplama', 'İnce İşler', 'Islak hacim ve zemin kaplama işleri'),
    ('a0000000-0000-0000-0000-000000000006', 'Isı Yalıtımı (Mantolama)', 'Kaba İnşaat', 'Dış cephe ısı yalıtım sistemi'),
    ('a0000000-0000-0000-0000-000000000007', 'Çatı İşleri', 'Kaba İnşaat', 'Çatı taşıyıcı sistem ve kaplama'),
    ('a0000000-0000-0000-0000-000000000008', 'Doğrama (PVC/Alüminyum Pencere-Kapı)', 'İnce İşler', 'Pencere ve kapı doğrama montajı');

INSERT INTO service_package_template_items (template_id, item_name, default_price_type, display_order) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Kalıp İşçiliği', 'per_m2', 1),
    ('a0000000-0000-0000-0000-000000000001', 'Demir Bağlama İşçiliği', 'fixed', 2),
    ('a0000000-0000-0000-0000-000000000001', 'Beton Dökümü İşçiliği', 'per_m2', 3),

    ('a0000000-0000-0000-0000-000000000002', 'Kaba Sıva', 'per_m2', 1),
    ('a0000000-0000-0000-0000-000000000002', 'Alçı (Saten)', 'per_m2', 2),
    ('a0000000-0000-0000-0000-000000000002', 'Astar', 'per_m2', 3),

    ('a0000000-0000-0000-0000-000000000003', 'Su Tesisatı', 'fixed', 1),
    ('a0000000-0000-0000-0000-000000000003', 'Doğalgaz Tesisatı', 'fixed', 2),
    ('a0000000-0000-0000-0000-000000000003', 'Elektrik Tesisatı', 'fixed', 3),

    ('a0000000-0000-0000-0000-000000000004', 'İç Cephe Boya', 'per_m2', 1),
    ('a0000000-0000-0000-0000-000000000004', 'Dış Cephe Boya', 'per_m2', 2),

    ('a0000000-0000-0000-0000-000000000005', 'Zemin Seramik/Fayans Döşeme', 'per_m2', 1),
    ('a0000000-0000-0000-0000-000000000005', 'Islak Hacim İzolasyonu', 'per_m2', 2),

    ('a0000000-0000-0000-0000-000000000006', 'Mantolama (EPS/Taşyünü)', 'per_m2', 1),

    ('a0000000-0000-0000-0000-000000000007', 'Çatı Taşıyıcı Sistem (Ahşap/Çelik)', 'per_m2', 1),
    ('a0000000-0000-0000-0000-000000000007', 'Kiremit/Membran Kaplama', 'per_m2', 2),

    ('a0000000-0000-0000-0000-000000000008', 'Pencere Montajı', 'fixed', 1),
    ('a0000000-0000-0000-0000-000000000008', 'Kapı Montajı', 'fixed', 2);

    `);
    }
    async down(queryRunner) {
        throw new Error('Bu migration için down() henüz yazılmadı -- elle geri almanız gerekir.');
    }
}
exports.TemplatesSchema1700000000007 = TemplatesSchema1700000000007;
//# sourceMappingURL=1700000000007-TemplatesSchema.js.map