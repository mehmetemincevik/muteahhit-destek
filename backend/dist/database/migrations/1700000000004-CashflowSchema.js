"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashflowSchema1700000000004 = void 0;
class CashflowSchema1700000000004 {
    constructor() {
        this.name = 'CashflowSchema1700000000004';
    }
    async up(queryRunner) {
        await queryRunner.query(`
-- ============================================
-- MODÜL 5: GELİR-GİDER TAKVİMİ (Çek, Kira, Ödeme + Gecikme Faizi)
-- ============================================

CREATE TABLE cashflow_calendar (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id   UUID NOT NULL REFERENCES users(id),

    -- NOT: Bu tablo PLANLANAN/BEKLENEN hareketleri tutar (örn. "15 Mart'ta 50.000 TL taksit
    -- gelecek"). GERÇEKLEŞEN tahsilat/ödeme ayrı tablolarda kayıtlıdır (payments, cost_payments,
    -- rental_payments). Kullanıcı bir kaydı 'paid' olarak işaretlediğinde:
    --   -> entry_type='installment_payment' ise: units.payments'a yeni satır eklenir
    --   -> entry_type='rent' ise: asset_rentals altına rental_payments'a yeni satır eklenir
    --   -> entry_type='check'/'other' ise: doğrudan asset_transactions'a yansır
    -- Yani cashflow_calendar TETİKLEYİCİ katmandır, gerçek para hareketi her zaman kendi
    -- asıl tablosuna (payments/rental_payments/asset_transactions) yazılır.
    entry_type      VARCHAR(30) NOT NULL
                        CHECK (entry_type IN ('check', 'rent', 'installment_payment', 'other')),
    direction       VARCHAR(10) NOT NULL CHECK (direction IN ('income', 'expense')),

    title           VARCHAR(200) NOT NULL,        -- "Çimento Bayii Çeki", "Kadıköy Daire Kirası" gibi
    original_amount NUMERIC(14,2) NOT NULL,        -- ilk belirlenen tutar (faizsiz)
    current_amount  NUMERIC(14,2) NOT NULL,         -- gecikme faizi dahil güncel tutar
                                                       -- (başlangıçta original_amount ile aynı)

    due_date        DATE NOT NULL,                  -- vade tarihi
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'paid', 'overdue')),
    paid_date        DATE,

    -- Faiz sadece vadesi geçip ödenmemişse işler. Oran manuel, kayıt bazında değişebilir.
    -- BASİT FAİZ: her gün eklenen faiz her zaman ORIGINAL_AMOUNT üzerinden hesaplanır,
    -- current_amount'un kendisi üzerinden değil (bileşik değil).
    -- Varsayılan günlük oran: %0,14 = 0.0014 (ondalık). DİKKAT: 0.14 yazarsak %14 olur, YANLIŞ olur.
    daily_interest_rate NUMERIC(6,4) DEFAULT 0.0014,   -- kayıt bazında değiştirilebilir, null bırakılabilir

    -- İlgili kayda opsiyonel referans (bir kira tahsilatı ise asset_rentals'a,
    -- bir daire tahsilatıysa units'e bağlanabilir -- polimorfik, source_table + source_id ile)
    source_table    VARCHAR(30),
    source_id       UUID,

    notes            TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Her gün işleyen faizin KALICI kaydı. Vadesi geçmiş ve ödenmemiş her kayıt için
-- günlük bir kez (n8n/cron ile tetiklenir) bu tabloya satır eklenir VE
-- cashflow_calendar.current_amount bu miktar kadar artırılır. Geçmiş asla silinmez/üzerine yazılmaz.
CREATE TABLE cashflow_interest_accruals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_entry_id   UUID NOT NULL REFERENCES cashflow_calendar(id) ON DELETE CASCADE,
    accrual_date        DATE NOT NULL,                -- hangi gün için işlediği
    interest_amount     NUMERIC(14,2) NOT NULL,         -- o gün eklenen faiz tutarı
    balance_before       NUMERIC(14,2) NOT NULL,
    balance_after         NUMERIC(14,2) NOT NULL,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (calendar_entry_id, accrual_date)   -- aynı gün için iki kez faiz işlemesin
);

-- ============================================
-- İŞ AKIŞI MANTIĞI (n8n / cron ile günlük tetiklenecek):
--
-- 1) Her gün, status = 'pending' AND due_date < bugün olan kayıtları bul
--    -> bunların status'unu 'overdue' yap
-- 2) status = 'overdue' olan her kayıt için (BASİT FAİZ -- her zaman orijinal anapara üzerinden):
--    interest = original_amount * daily_interest_rate      <-- current_amount DEĞİL, original_amount!
--    current_amount += interest
--    cashflow_interest_accruals'a KALICI satır ekle (balance_before, balance_after ile)
-- 3) Kullanıcı ödemeyi işaretlediğinde (status='paid'):
--    -> paid_date doldurulur, current_amount sabitlenir (artık faiz işlemez)
--    -> asset_transactions'a ilgili giriş/çıkış otomatik düşer
-- ============================================

    `);
    }
    async down(queryRunner) {
        throw new Error('down() tanımlı değil; geri alma elle yapılmalıdır.');
    }
}
exports.CashflowSchema1700000000004 = CashflowSchema1700000000004;
//# sourceMappingURL=1700000000004-CashflowSchema.js.map