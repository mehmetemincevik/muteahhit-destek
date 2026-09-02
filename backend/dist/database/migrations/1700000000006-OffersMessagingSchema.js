"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffersMessagingSchema1700000000006 = void 0;
class OffersMessagingSchema1700000000006 {
    constructor() {
        this.name = 'OffersMessagingSchema1700000000006';
    }
    async up(queryRunner) {
        await queryRunner.query(`
-- ============================================
-- MODÜL 7: TEKLİF / MESAJLAŞMA (Proje Bağlamında, Çift Yönlü)
-- ============================================

-- Bir konuşma HER ZAMAN bir proje + bir usta + o projenin müteahhidi üçlüsüne bağlı.
-- Proje bağlamı olmadan serbest mesajlaşma YOK.
CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    craftsman_id    UUID NOT NULL REFERENCES craftsman_profiles(id) ON DELETE CASCADE,
    contractor_id   UUID NOT NULL REFERENCES users(id),

    last_message_at TIMESTAMPTZ,           -- CACHE -- sıralama için (son mesaj zamanı)
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (project_id, craftsman_id)        -- bu proje-usta ikilisi için tek bir konuşma hattı
);

-- Konuşma içindeki her mesaj. Teklifler de bu tabloda 'offer' tipinde bir mesaj olarak görünür
-- (yani DM ekranında akış içinde teklif kartı olarak gösterilir), asıl teklif detayı offers'ta.
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES users(id),   -- hem usta hem müteahhit gönderebilir

    message_type    VARCHAR(10) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'offer')),
    content         TEXT,                                  -- text tipinde asıl mesaj metni

    read_at            TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Teklif detayı. message_type='offer' olan bir messages satırına 1-1 bağlı.
-- Hem usta hem müteahhit teklif başlatabilir (sender_role bunu ayırt eder).
CREATE TABLE offers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID NOT NULL UNIQUE REFERENCES messages(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

    sender_role     VARCHAR(15) NOT NULL CHECK (sender_role IN ('contractor', 'craftsman')),
    package_id      UUID REFERENCES craftsman_service_packages(id),   -- hangi hizmet paketi için (varsa)

    amount            NUMERIC(14,2) NOT NULL,
    description         TEXT,

    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'accepted', 'rejected', 'countered')),

    -- Eğer bu teklif başka bir teklife karşı-teklif (counter-offer) ise
    counters_offer_id     UUID REFERENCES offers(id),

    responded_at            TIMESTAMPTZ,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- İŞ AKIŞI MANTIĞI:
-- 1) Teklif gönderildiğinde messages ve offers kayıtları birlikte oluşur
-- 2) Karşı taraf: kabul ederse status='accepted' olur VE otomatik olarak
--    project_craftsman_assignments tablosunda yeni bir kayıt açılır (agreed_price = offers.amount)
-- 3) Reddederse status='rejected'
-- 4) Karşı teklif yaparsa yeni bir offers satırı oluşur, counters_offer_id ile eskisine bağlanır,
--    eski teklif status='countered' olarak işaretlenir
-- ============================================

    `);
    }
    async down(queryRunner) {
        throw new Error('down() tanımlı değil; geri alma elle yapılmalıdır.');
    }
}
exports.OffersMessagingSchema1700000000006 = OffersMessagingSchema1700000000006;
//# sourceMappingURL=1700000000006-OffersMessagingSchema.js.map