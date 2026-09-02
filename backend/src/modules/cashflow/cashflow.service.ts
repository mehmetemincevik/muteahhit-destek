import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  CashflowCalendar,
  CashflowEntryType,
  CashflowStatus,
} from './entities/cashflow-calendar.entity';
import { CashflowInterestAccrual } from './entities/cashflow-interest-accrual.entity';
import { AssetTransaction, AssetTransactionType } from '../assets/entities/asset-transaction.entity';
import { CreateCashflowEntryDto } from './dto/create-cashflow-entry.dto';
import { MarkAsPaidDto } from './dto/mark-as-paid.dto';
import { PaymentsService } from '../payments/payments.service';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class CashflowService {
  private readonly logger = new Logger(CashflowService.name);

  constructor(
    @InjectRepository(CashflowCalendar) private readonly calendarRepo: Repository<CashflowCalendar>,
    @InjectRepository(CashflowInterestAccrual)
    private readonly accrualRepo: Repository<CashflowInterestAccrual>,
    @InjectRepository(AssetTransaction)
    private readonly assetTransactionRepo: Repository<AssetTransaction>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly paymentsService: PaymentsService,
    private readonly assetsService: AssetsService,
  ) {}

  async create(contractorId: string, dto: CreateCashflowEntryDto): Promise<CashflowCalendar> {
    // unitId / rentalId, polimorfik sourceTable + sourceId çiftine dönüştürülür.
    //
    // Bu aşamada referansın sahipliği doğrulanmaz; kayıt yalnızca bir plandır ve para
    // hareketi oluşturmaz. Doğrulama markAsPaid() içinde, ilgili servis çağrıldığında
    // yapılır. Sonuç olarak geçersiz bir referansla kayıt açılabilir, ancak ödeme
    // adımında hata verir.
    let sourceTable: string | undefined;
    let sourceId: string | undefined;
    if (dto.unitId) {
      sourceTable = 'units';
      sourceId = dto.unitId;
    } else if (dto.rentalId) {
      sourceTable = 'asset_rentals';
      sourceId = dto.rentalId;
    }

    const entry = this.calendarRepo.create({
      contractorId,
      entryType: dto.entryType,
      direction: dto.direction,
      title: dto.title,
      originalAmount: dto.originalAmount,
      currentAmount: dto.originalAmount, // başlangıçta faiz yok, orijinal tutarla aynı
      dueDate: new Date(dto.dueDate),
      dailyInterestRate: dto.dailyInterestRate,
      sourceTable,
      sourceId,
      notes: dto.notes,
    });
    return this.calendarRepo.save(entry);
  }

  async findAllForContractor(contractorId: string): Promise<CashflowCalendar[]> {
    return this.calendarRepo.find({
      where: { contractorId },
      order: { dueDate: 'ASC' },
    });
  }

  private async assertEntryOwnership(contractorId: string, entryId: string): Promise<CashflowCalendar> {
    const entry = await this.calendarRepo.findOne({ where: { id: entryId } });
    if (!entry) {
      throw new NotFoundException('Takvim kaydı bulunamadı');
    }
    if (entry.contractorId !== contractorId) {
      throw new ForbiddenException('Bu takvim kaydına erişim yetkiniz yok');
    }
    return entry;
  }

  async getEntryDetail(contractorId: string, entryId: string) {
    const entry = await this.assertEntryOwnership(contractorId, entryId);
    const accruals = await this.accrualRepo.find({
      where: { calendarEntryId: entryId },
      order: { accrualDate: 'ASC' },
    });
    return { entry, accruals };
  }

  // Planlanan kaydı gerçekleşen işleme dönüştürür. Hedef tablo entryType'a göre değişir:
  //   installment_payment -> payments
  //   rent                -> rental_payments
  //   check / other       -> asset_transactions

  async markAsPaid(
    contractorId: string,
    entryId: string,
    dto: MarkAsPaidDto,
  ): Promise<CashflowCalendar> {
    const entry = await this.assertEntryOwnership(contractorId, entryId);

    if (entry.status === CashflowStatus.PAID) {
      throw new BadRequestException('Bu kayıt zaten ödendi olarak işaretlenmiş');
    }

    // Gerçekleşen kayıt ve takvim kaydının kapatılması tek transaction içinde yapılır.
    // Çağrılan servislere aynı manager geçirilir; böylece iç içe transaction açılmaz
    // ve herhangi bir adımda hata olursa tüm işlem geri alınır.
    return this.dataSource.transaction(async (manager) => {
      switch (entry.entryType) {
        case CashflowEntryType.INSTALLMENT_PAYMENT: {
          if (!entry.sourceId) {
            throw new BadRequestException(
              'Bu kayıt oluşturulurken unitId belirtilmemiş, hangi daireye ait olduğu bilinmiyor',
            );
          }
          // PaymentsService.create() sahiplik doğrulaması ve defter kaydını kendisi yapar.
          await this.paymentsService.create(
            contractorId,
            entry.sourceId,
            {
              amount: entry.currentAmount,
              paymentDate: dto.paidDate,
              paymentMethod: dto.paymentMethod as any,
              note: `Takvim kaydından: ${entry.title}`,
            },
            manager,
          );
          break;
        }
        case CashflowEntryType.RENT: {
          if (!entry.sourceId) {
            throw new BadRequestException(
              'Bu kayıt oluşturulurken rentalId belirtilmemiş, hangi kira sözleşmesine ait olduğu bilinmiyor',
            );
          }
          await this.assetsService.addRentalPayment(
            contractorId,
            entry.sourceId,
            {
              amount: entry.currentAmount,
              paymentDate: dto.paidDate,
              note: `Takvim kaydından: ${entry.title}`,
            },
            manager,
          );
          break;
        }
        case CashflowEntryType.CHECK:
        case CashflowEntryType.OTHER: {
          // Genel deftere yazılır; assetId boş bırakılır.
          const isIncome = entry.direction === 'income';
          await manager.save(
            manager.create(AssetTransaction, {
              contractorId,
              transactionType: isIncome
                ? AssetTransactionType.MANUAL_ADDITION
                : AssetTransactionType.MANUAL_DEDUCTION,
              amount: isIncome ? entry.currentAmount : -entry.currentAmount,
              sourceTable: 'cashflow_calendar',
              sourceId: entry.id,
              transactionDate: new Date(dto.paidDate),
              description: entry.title,
            }),
          );
          break;
        }
      }

      entry.status = CashflowStatus.PAID;
      entry.paidDate = new Date(dto.paidDate);
      return manager.save(entry);
    });
  }

  // Gecikme faizi tahakkuku.

  // Her gün 00:05'te çalışır. Saat, sunucunun yerel saat dilimine göre yorumlanır;
  // farklı bölgede çalıştırılacaksa TZ ayarı kontrol edilmeli.
  @Cron('5 0 * * *')
  async handleDailyAccrualCron(): Promise<void> {
    this.logger.log('Günlük faiz işletme zamanlayıcısı başladı...');
    const result = await this.runDailyAccrual();
    this.logger.log(
      `Tamamlandı: ${result.markedOverdue} kayıt gecikmiş işaretlendi, ` +
        `${result.interestApplied} kayda faiz işlendi, ${result.skipped} kayıt atlandı.`,
    );
  }

  // Hem zamanlayıcı hem de sistem ucu tarafından çağrılır. Aynı gün içinde birden çok
  // kez çalıştırılması güvenlidir; mükerrer tahakkuk (calendar_entry_id, accrual_date)
  // benzersiz kısıtıyla engellenir.
  async runDailyAccrual(): Promise<{ markedOverdue: number; interestApplied: number; skipped: number }> {
    // Vadesi geçmiş bekleyen kayıtlar gecikmiş olarak işaretlenir.
    const overdueResult = await this.dataSource.query(
      `UPDATE cashflow_calendar
       SET status = 'overdue', updated_at = now()
       WHERE status = 'pending' AND due_date < CURRENT_DATE
       RETURNING id`,
    );
    const markedOverdue = overdueResult.length;

    // Faiz oranı tanımlı gecikmiş kayıtlar işlenir.
    const overdueEntries = await this.calendarRepo
      .createQueryBuilder('entry')
      .where('entry.status = :status', { status: CashflowStatus.OVERDUE })
      .andWhere('entry.dailyInterestRate IS NOT NULL')
      .getMany();

    let interestApplied = 0;
    let skipped = 0;

    for (const entry of overdueEntries) {
      // Basit faiz: taban her zaman anapara, birikmiş tutar değil.
      const interest = Number(entry.originalAmount) * Number(entry.dailyInterestRate);
      const balanceBefore = Number(entry.currentAmount);
      const balanceAfter = balanceBefore + interest;

      // Tahakkuk kaydı ve bakiye güncellemesi kayıt bazında tek transaction içinde
      // yapılır; biri yazılıp diğeri yazılmazsa faiz geçmişi ile güncel tutar
      // birbirini tutmaz.
      //
      // Aynı gün için ikinci kayıt eklenmez. RETURNING boş dönerse tahakkuk zaten
      // yapılmış demektir ve bakiye güncellenmez.
      //
      // Sınırlama: kayıtlar tek tek işleniyor. Kayıt sayısı arttığında toplu bir
      // sorguya dönüştürülmesi gerekir.
      const applied = await this.dataSource.transaction(async (manager) => {
        const inserted = await manager.query(
          `INSERT INTO cashflow_interest_accruals
             (calendar_entry_id, accrual_date, interest_amount, balance_before, balance_after)
           VALUES ($1, CURRENT_DATE, $2, $3, $4)
           ON CONFLICT (calendar_entry_id, accrual_date) DO NOTHING
           RETURNING id`,
          [entry.id, interest, balanceBefore, balanceAfter],
        );

        if (inserted.length === 0) {
          return false;
        }

        await manager.update(CashflowCalendar, entry.id, { currentAmount: balanceAfter });
        return true;
      });

      if (applied) {
        interestApplied++;
      } else {
        skipped++; // bugün için zaten işlenmiş
      }
    }

    return { markedOverdue, interestApplied, skipped };
  }
}
