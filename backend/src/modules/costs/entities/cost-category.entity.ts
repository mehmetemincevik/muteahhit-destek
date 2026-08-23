import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum CostType {
  FIXED = 'fixed', // statik maliyet (arsa bedeli, ruhsat harcı gibi tek seferlik/sabit)
  VARIABLE = 'variable', // değişken maliyet (malzeme fiyatı piyasaya göre dalgalanan)
}

// NOT: Bu tablo proje/müteahhide ÖZEL değil -- SQL şemasında contractor_id/project_id
// hiç yok, bilerek. Kategoriler (örn. "Beton", "Demir", "Elektrik Malzeme") TÜM
// müteahhitlerin ortak kullandığı, paylaşılan bir liste. Herkes yeni kategori ekleyebilir,
// ama var olan bir kategori herkese görünür (tıpkı service_package_templates gibi).
@Entity('cost_categories')
export class CostCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'cost_type', type: 'varchar', length: 20 })
  costType: CostType;

  @Column({ name: 'is_system_default', type: 'boolean', default: false })
  isSystemDefault: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
