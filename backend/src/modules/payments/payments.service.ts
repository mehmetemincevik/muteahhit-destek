import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Unit } from '../units/entities/unit.entity';
import { AssetTransaction, AssetTransactionType } from '../assets/entities/asset-transaction.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

interface UnitPaymentSummary {
  unit_id: string;
  sale_price: string | null;
  total_paid: string;
  remaining_balance: string | null;
  payment_count: string;
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Unit) private readonly unitRepo: Repository<Unit>,
    @InjectRepository(AssetTransaction)
    private readonly assetTransactionRepo: Repository<AssetTransaction>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  // Aynı desen: önce bu dairenin gerçekten bu müteahhide ait olduğunu doğrula.
  // units.service.ts'teki updateStatus ile birebir aynı yaklaşım (relations üzerinden
  // block -> project zincirini takip ederek).
  private async assertUnitOwnership(contractorId: string, unitId: string): Promise<Unit> {
    const unit = await this.unitRepo.findOne({
      where: { id: unitId },
      relations: ['block', 'block.project'],
    });
    if (!unit) {
      throw new NotFoundException('Daire bulunamadı');
    }
    if (unit.block.project.contractorId !== contractorId) {
      throw new ForbiddenException('Bu daireye erişim yetkiniz yok');
    }
    return unit;
  }

  async create(contractorId: string, unitId: string, dto: CreatePaymentDto): Promise<Payment> {
    await this.assertUnitOwnership(contractorId, unitId);

    const payment = this.paymentRepo.create({
      unitId,
      amount: dto.amount,
      paymentDate: new Date(dto.paymentDate),
      paymentMethod: dto.paymentMethod,
      note: dto.note,
    });
    const saved = await this.paymentRepo.save(payment);

    // TODO artık tamamlandı: her ödeme, genel deftere (asset_transactions) otomatik düşer.
    // asset_id bilerek NULL bırakılıyor -- bu, belirli bir isimli varlığa (örn. "Vakıfbank
    // Hesabı") değil, genel bir gelir kaydına karşılık geliyor. Kullanıcı isterse ayrıca bu
    // parayı Varlıklar modülünden belirli bir nakit varlığa manuel olarak da ekleyebilir.
    await this.assetTransactionRepo.save(
      this.assetTransactionRepo.create({
        contractorId,
        transactionType: AssetTransactionType.UNIT_SALE_PAYMENT,
        amount: dto.amount,
        sourceTable: 'payments',
        sourceId: saved.id,
        transactionDate: new Date(dto.paymentDate),
      }),
    );

    return saved;
  }

  async findByUnit(contractorId: string, unitId: string): Promise<Payment[]> {
    await this.assertUnitOwnership(contractorId, unitId);
    return this.paymentRepo.find({
      where: { unitId },
      order: { paymentDate: 'ASC' },
    });
  }

  // unit_payment_summary bir VIEW -- normal bir entity/tablo değil, bu yüzden Repository
  // deseni yerine doğrudan SQL sorgusu çalıştırıyoruz. dataSource.query(), parametreleri
  // ($1 gibi) güvenli şekilde (SQL injection riski olmadan) yerleştirir.
  async getBalance(contractorId: string, unitId: string): Promise<UnitPaymentSummary> {
    await this.assertUnitOwnership(contractorId, unitId);

    const rows: UnitPaymentSummary[] = await this.dataSource.query(
      'SELECT * FROM unit_payment_summary WHERE unit_id = $1',
      [unitId],
    );

    // View, o daireye ait hiç veri olmasa bile (LEFT JOIN sayesinde) bir satır döner,
    // bu yüzden burada "bulunamadı" durumu normalde oluşmaz -- yine de güvenlik amaçlı kontrol.
    if (!rows.length) {
      throw new NotFoundException('Bu daire için bakiye bilgisi bulunamadı');
    }
    return rows[0];
  }
}
