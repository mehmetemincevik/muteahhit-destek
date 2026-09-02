import { MigrationInterface, QueryRunner } from 'typeorm';

// Şablon kimliklerini geçerli v4 UUID'lerle değiştirir. Eski değerler sürüm biçimi
// taşımadığı için DTO doğrulamasından geçmiyor ve şablondan paket oluşturulamıyordu.
// Kaynak: schema/12_fix_template_uuids.sql
export class FixTemplateUuids1700000000011 implements MigrationInterface {
  name = 'FixTemplateUuids1700000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
-- Şablon kayıtlarının kimlikleri sürüm biçimi taşımayan sabit değerlerle yazılmıştı
-- ('a0000000-0000-0000-0000-000000000001'). Bu değerler UUID doğrulamasından geçmediği
-- için şablondan paket oluşturma isteği 400 ile reddediliyordu.
--
-- Kimlikler geçerli v4 UUID'lerle değiştirilir. Bağlı kayıtlar
-- (service_package_template_items, craftsman_service_packages) foreign key ile bağlı
-- olduğundan güncelleme sırası önemlidir: önce child tabloların referansları geçici
-- olarak boşaltılmaz, bunun yerine tüm tablolar tek deyimde eşlemeye göre güncellenir.
-- Bu, FOREIGN KEY kısıtı DEFERRABLE olmadığı için tek bir UPDATE ... FROM zinciriyle
-- değil, kısıt geçici olarak kaldırılıp yeniden eklenerek yapılır.

ALTER TABLE service_package_template_items
    DROP CONSTRAINT IF EXISTS service_package_template_items_template_id_fkey;

ALTER TABLE craftsman_service_packages
    DROP CONSTRAINT IF EXISTS fk_package_template;

WITH id_map(old_id, new_id) AS (
    VALUES
        ('a0000000-0000-0000-0000-000000000001'::uuid, '76f4e56a-85d1-4da2-bfc6-b7b42f8d074e'::uuid),
        ('a0000000-0000-0000-0000-000000000002'::uuid, 'b8210feb-77e8-4f0a-b086-ea4570643586'::uuid),
        ('a0000000-0000-0000-0000-000000000003'::uuid, 'cbdd3d70-e1b4-471f-ac2d-e03c4a854602'::uuid),
        ('a0000000-0000-0000-0000-000000000004'::uuid, '0ca08afe-dadf-44fb-8ec5-f7ac17254378'::uuid),
        ('a0000000-0000-0000-0000-000000000005'::uuid, '6a550b2c-1f27-42e5-a117-aa69dd4dba15'::uuid),
        ('a0000000-0000-0000-0000-000000000006'::uuid, '50218f83-3786-42c2-9611-00234f2b5976'::uuid),
        ('a0000000-0000-0000-0000-000000000007'::uuid, '2426bf77-f64e-4daf-b6b2-8aa688eef239'::uuid),
        ('a0000000-0000-0000-0000-000000000008'::uuid, '925fd739-603f-460b-9b27-e9c858b169a9'::uuid)
)
UPDATE service_package_templates t
SET id = m.new_id
FROM id_map m
WHERE t.id = m.old_id;

WITH id_map(old_id, new_id) AS (
    VALUES
        ('a0000000-0000-0000-0000-000000000001'::uuid, '76f4e56a-85d1-4da2-bfc6-b7b42f8d074e'::uuid),
        ('a0000000-0000-0000-0000-000000000002'::uuid, 'b8210feb-77e8-4f0a-b086-ea4570643586'::uuid),
        ('a0000000-0000-0000-0000-000000000003'::uuid, 'cbdd3d70-e1b4-471f-ac2d-e03c4a854602'::uuid),
        ('a0000000-0000-0000-0000-000000000004'::uuid, '0ca08afe-dadf-44fb-8ec5-f7ac17254378'::uuid),
        ('a0000000-0000-0000-0000-000000000005'::uuid, '6a550b2c-1f27-42e5-a117-aa69dd4dba15'::uuid),
        ('a0000000-0000-0000-0000-000000000006'::uuid, '50218f83-3786-42c2-9611-00234f2b5976'::uuid),
        ('a0000000-0000-0000-0000-000000000007'::uuid, '2426bf77-f64e-4daf-b6b2-8aa688eef239'::uuid),
        ('a0000000-0000-0000-0000-000000000008'::uuid, '925fd739-603f-460b-9b27-e9c858b169a9'::uuid)
)
UPDATE service_package_template_items i
SET template_id = m.new_id
FROM id_map m
WHERE i.template_id = m.old_id;

WITH id_map(old_id, new_id) AS (
    VALUES
        ('a0000000-0000-0000-0000-000000000001'::uuid, '76f4e56a-85d1-4da2-bfc6-b7b42f8d074e'::uuid),
        ('a0000000-0000-0000-0000-000000000002'::uuid, 'b8210feb-77e8-4f0a-b086-ea4570643586'::uuid),
        ('a0000000-0000-0000-0000-000000000003'::uuid, 'cbdd3d70-e1b4-471f-ac2d-e03c4a854602'::uuid),
        ('a0000000-0000-0000-0000-000000000004'::uuid, '0ca08afe-dadf-44fb-8ec5-f7ac17254378'::uuid),
        ('a0000000-0000-0000-0000-000000000005'::uuid, '6a550b2c-1f27-42e5-a117-aa69dd4dba15'::uuid),
        ('a0000000-0000-0000-0000-000000000006'::uuid, '50218f83-3786-42c2-9611-00234f2b5976'::uuid),
        ('a0000000-0000-0000-0000-000000000007'::uuid, '2426bf77-f64e-4daf-b6b2-8aa688eef239'::uuid),
        ('a0000000-0000-0000-0000-000000000008'::uuid, '925fd739-603f-460b-9b27-e9c858b169a9'::uuid)
)
UPDATE craftsman_service_packages p
SET template_id = m.new_id
FROM id_map m
WHERE p.template_id = m.old_id;

ALTER TABLE service_package_template_items
    ADD CONSTRAINT service_package_template_items_template_id_fkey
    FOREIGN KEY (template_id) REFERENCES service_package_templates(id) ON DELETE CASCADE;

ALTER TABLE craftsman_service_packages
    ADD CONSTRAINT fk_package_template
    FOREIGN KEY (template_id) REFERENCES service_package_templates(id);

    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // TODO: Geri alma yazılmadı. Eski kimlikler zaten geçersiz biçimdeydi.
    throw new Error('down() tanımlı değil; geri alma elle yapılmalıdır.');
  }
}
