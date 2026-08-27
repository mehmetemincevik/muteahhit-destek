import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum CostType {
  FIXED = 'fixed', // baştan belli, tek seferlik kalemler (arsa bedeli, harç)
  VARIABLE = 'variable', // piyasa fiyatına bağlı kalemler (beton, demir)
}

// Kategoriler tüm hesaplar arasında ortaktır; tabloda contractor_id yok. Bir kullanıcının
// eklediği kategori diğerlerine de görünür.
//
// TODO: Kategori listesinin hesaba özel mi yoksa ortak mı olacağı netleştirilmeli.
// Ortak kalacaksa yeni kayıt eklemeyi kısıtlamak (yalnızca sistem varsayılanları),
// hesaba özel olacaksa contractor_id eklemek gerekiyor.
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
