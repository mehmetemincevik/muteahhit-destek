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
-- sıfırdan kendi paketini de oluşturabilir.
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

-- craftsman_service_packages.template_id referansı
ALTER TABLE craftsman_service_packages ADD CONSTRAINT fk_package_template
    FOREIGN KEY (template_id) REFERENCES service_package_templates(id);

-- ============================================
-- ÖRNEK VERİ: Sektörde gerçekten kullanılan tipik paketleme (başlangıç seti)
-- ============================================

INSERT INTO service_package_templates (id, name, category, description) VALUES
    ('76f4e56a-85d1-4da2-bfc6-b7b42f8d074e', 'Kaba İnşaat (Kalıp-Demir-Beton)', 'Kaba İnşaat', 'Temelden çatıya taşıyıcı sistem işleri'),
    ('b8210feb-77e8-4f0a-b086-ea4570643586', 'Sıva-Alçı-Astar', 'İnce İşler', 'Duvar ve tavan sıva, alçı, astar işleri'),
    ('cbdd3d70-e1b4-471f-ac2d-e03c4a854602', 'Su-Doğalgaz-Elektrik Tesisatı', 'Tesisat', 'Kombine mekanik ve elektrik tesisat paketi'),
    ('0ca08afe-dadf-44fb-8ec5-f7ac17254378', 'Boya-Badana', 'İnce İşler', 'İç/dış cephe boya işleri'),
    ('6a550b2c-1f27-42e5-a117-aa69dd4dba15', 'Seramik-Fayans-Zemin Kaplama', 'İnce İşler', 'Islak hacim ve zemin kaplama işleri'),
    ('50218f83-3786-42c2-9611-00234f2b5976', 'Isı Yalıtımı (Mantolama)', 'Kaba İnşaat', 'Dış cephe ısı yalıtım sistemi'),
    ('2426bf77-f64e-4daf-b6b2-8aa688eef239', 'Çatı İşleri', 'Kaba İnşaat', 'Çatı taşıyıcı sistem ve kaplama'),
    ('925fd739-603f-460b-9b27-e9c858b169a9', 'Doğrama (PVC/Alüminyum Pencere-Kapı)', 'İnce İşler', 'Pencere ve kapı doğrama montajı');

INSERT INTO service_package_template_items (template_id, item_name, default_price_type, display_order) VALUES
    ('76f4e56a-85d1-4da2-bfc6-b7b42f8d074e', 'Kalıp İşçiliği', 'per_m2', 1),
    ('76f4e56a-85d1-4da2-bfc6-b7b42f8d074e', 'Demir Bağlama İşçiliği', 'fixed', 2),
    ('76f4e56a-85d1-4da2-bfc6-b7b42f8d074e', 'Beton Dökümü İşçiliği', 'per_m2', 3),

    ('b8210feb-77e8-4f0a-b086-ea4570643586', 'Kaba Sıva', 'per_m2', 1),
    ('b8210feb-77e8-4f0a-b086-ea4570643586', 'Alçı (Saten)', 'per_m2', 2),
    ('b8210feb-77e8-4f0a-b086-ea4570643586', 'Astar', 'per_m2', 3),

    ('cbdd3d70-e1b4-471f-ac2d-e03c4a854602', 'Su Tesisatı', 'fixed', 1),
    ('cbdd3d70-e1b4-471f-ac2d-e03c4a854602', 'Doğalgaz Tesisatı', 'fixed', 2),
    ('cbdd3d70-e1b4-471f-ac2d-e03c4a854602', 'Elektrik Tesisatı', 'fixed', 3),

    ('0ca08afe-dadf-44fb-8ec5-f7ac17254378', 'İç Cephe Boya', 'per_m2', 1),
    ('0ca08afe-dadf-44fb-8ec5-f7ac17254378', 'Dış Cephe Boya', 'per_m2', 2),

    ('6a550b2c-1f27-42e5-a117-aa69dd4dba15', 'Zemin Seramik/Fayans Döşeme', 'per_m2', 1),
    ('6a550b2c-1f27-42e5-a117-aa69dd4dba15', 'Islak Hacim İzolasyonu', 'per_m2', 2),

    ('50218f83-3786-42c2-9611-00234f2b5976', 'Mantolama (EPS/Taşyünü)', 'per_m2', 1),

    ('2426bf77-f64e-4daf-b6b2-8aa688eef239', 'Çatı Taşıyıcı Sistem (Ahşap/Çelik)', 'per_m2', 1),
    ('2426bf77-f64e-4daf-b6b2-8aa688eef239', 'Kiremit/Membran Kaplama', 'per_m2', 2),

    ('925fd739-603f-460b-9b27-e9c858b169a9', 'Pencere Montajı', 'fixed', 1),
    ('925fd739-603f-460b-9b27-e9c858b169a9', 'Kapı Montajı', 'fixed', 2);

    `);
    }
    async down(queryRunner) {
        throw new Error('down() tanımlı değil; geri alma elle yapılmalıdır.');
    }
}
exports.TemplatesSchema1700000000007 = TemplatesSchema1700000000007;
//# sourceMappingURL=1700000000007-TemplatesSchema.js.map