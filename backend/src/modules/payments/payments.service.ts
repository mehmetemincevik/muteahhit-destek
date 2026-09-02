import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
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

  // Sahiplik, daire -> blok -> proje ilişkisi üzerinden doğrulanır.
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

  // externalManager verildiğinde çağıranın transaction'ı içinde çalışır; verilmediğinde
  // kendi transaction'ını açar. Bu ayrım, CashflowService.markAsPaid gibi bu metodu daha
  // geniş bir işlemin parçası olarak çağıran yerlerde iç içe transaction açılmasını önler.
  async create(
    contractorId: string,
    unitId: string,
    dto: CreatePaymentDto,
    externalManager?: EntityManager,
  ): Promise<Payment> {
    await this.assertUnitOwnership(contractorId, unitId);

    const run = async (manager: EntityManager): Promise<Payment> => {
      const payment = manager.create(Payment, {
        unitId,
        amount: dto.amount,
        paymentDate: new Date(dto.paymentDate),
        paymentMethod: dto.paymentMethod,
        note: dto.note,
      });
      const saved = await manager.save(payment);

      // Ödeme ve defter kaydı aynı transaction içinde yazılır; biri başarısız olursa
      // ikisi de geri alınır. assetId boş bırakılır: kayıt belirli bir nakit hesabına
      // değil, genel deftere düşer.
      await manager.save(
        manager.create(AssetTransaction, {
          contractorId,
          transactionType: AssetTransactionType.UNIT_SALE_PAYMENT,
          amount: dto.amount,
          sourceTable: 'payments',
          sourceId: saved.id,
          transactionDate: new Date(dto.paymentDate),
        }),
      );

      return saved;
    };

    return externalManager ? run(externalManager) : this.dataSource.transaction(run);
  }

  async findByUnit(contractorId: string, unitId: string): Promise<Payment[]> {
    await this.assertUnitOwnership(contractorId, unitId);
    return this.paymentRepo.find({
      where: { unitId },
      order: { paymentDate: 'ASC' },
    });
  }

  // unit_payment_summary bir view olduğu için repository yerine parametreli ham sorgu
  // kullanılır. Dönen alanlar snake_case ve numeric değerler string'dir.
  async getBalance(contractorId: string, unitId: string): Promise<UnitPaymentSummary> {
    await this.assertUnitOwnership(contractorId, unitId);

    const rows: UnitPaymentSummary[] = await this.dataSource.query(
      'SELECT * FROM unit_payment_summary WHERE unit_id = $1',
      [unitId],
    );

    // View LEFT JOIN kullandığı için hiç ödeme olmasa da satır döner; boş sonuç
    // yalnızca daire silinmişse oluşur.
    if (!rows.length) {
      throw new NotFoundException('Bu daire için bakiye bilgisi bulunamadı');
    }
    return rows[0];
  }
}
