import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
    // unitId/rentalId'den polimorfik source_table/source_id'yi biz oluşturuyoruz --
    // NOT: burada bilerek DERİN yetki kontrolü yapmıyoruz (bu sadece "planlanan" bir kayıt).
    // Gerçek güvenlik kontrolü, markAsPaid() içinde PaymentsService/AssetsService çağrıldığında
    // devreye giriyor -- para gerçekten hareket ederken tam doğrulama zaten zorunlu oluyor.
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

  // --- Ödendi İşaretleme: entry_type'a göre GERÇEK kayda dönüştürür ---

  async markAsPaid(
    contractorId: string,
    entryId: string,
    dto: MarkAsPaidDto,
  ): Promise<CashflowCalendar> {
    const entry = await this.assertEntryOwnership(contractorId, entryId);

    if (entry.status === CashflowStatus.PAID) {
      throw new BadRequestException('Bu kayıt zaten ödendi olarak işaretlenmiş');
    }

    switch (entry.entryType) {
      case CashflowEntryType.INSTALLMENT_PAYMENT: {
        if (!entry.sourceId) {
          throw new BadRequestException(
            'Bu kayıt oluşturulurken unitId belirtilmemiş, hangi daireye ait olduğu bilinmiyor',
          );
        }
        // PaymentsService.create() ZATEN yetki kontrolü + otomatik defter kaydı yapıyor --
        // burada tekrar yazmıyoruz, olduğu gibi yeniden kullanıyoruz.
        await this.paymentsService.create(contractorId, entry.sourceId, {
          amount: entry.currentAmount,
          paymentDate: dto.paidDate,
          paymentMethod: dto.paymentMethod as any,
          note: `Takvim kaydından: ${entry.title}`,
        });
        break;
      }
      case CashflowEntryType.RENT: {
        if (!entry.sourceId) {
          throw new BadRequestException(
            'Bu kayıt oluşturulurken rentalId belirtilmemiş, hangi kira sözleşmesine ait olduğu bilinmiyor',
          );
        }
        await this.assetsService.addRentalPayment(contractorId, entry.sourceId, {
          amount: entry.currentAmount,
          paymentDate: dto.paidDate,
          note: `Takvim kaydından: ${entry.title}`,
        });
        break;
      }
      case CashflowEntryType.CHECK:
      case CashflowEntryType.OTHER: {
        // Belirli bir isimli varlığa değil, doğrudan genel deftere yazıyoruz (payments'taki
        // unit_sale_payment/cost_payment ile aynı mantık -- asset_id NULL).
        const isIncome = entry.direction === 'income';
        await this.assetTransactionRepo.save(
          this.assetTransactionRepo.create({
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
    return this.calendarRepo.save(entry);
  }

  // --- Günlük Faiz İşletme ---

  // Uygulama içi zamanlayıcı: her gece 00:05'te OTOMATİK çalışır, n8n gibi dış bir araca
  // ihtiyaç YOK. '5 0 * * *' = "her gün saat 00:05'te" (cron syntax: dakika saat gün ay haftagünü).
  // Sunucu Türkiye saatinde çalışıyorsa bu saat de Türkiye saatine göre olur.
  @Cron('5 0 * * *')
  async handleDailyAccrualCron(): Promise<void> {
    this.logger.log('Günlük faiz işletme zamanlayıcısı başladı...');
    const result = await this.runDailyAccrual();
    this.logger.log(
      `Tamamlandı: ${result.markedOverdue} kayıt gecikmiş işaretlendi, ` +
        `${result.interestApplied} kayda faiz işlendi, ${result.skipped} kayıt atlandı.`,
    );
  }

  // API key korumalı endpoint tarafından (manuel tetikleme/test/tekrar çalıştırma için) VE
  // yukarıdaki cron tarafından (otomatik günlük çalışma için) çağrılır. Aynı gün için mükerrer
  // çalıştırılsa bile ON CONFLICT DO NOTHING sayesinde güvenlidir (bkz. aşağıdaki mantık).
  async runDailyAccrual(): Promise<{ markedOverdue: number; interestApplied: number; skipped: number }> {
    // 1) Vadesi geçmiş ama hâlâ 'pending' olan kayıtları 'overdue' yap
    const overdueResult = await this.dataSource.query(
      `UPDATE cashflow_calendar
       SET status = 'overdue', updated_at = now()
       WHERE status = 'pending' AND due_date < CURRENT_DATE
       RETURNING id`,
    );
    const markedOverdue = overdueResult.length;

    // 2) 'overdue' VE faiz oranı tanımlı olan tüm kayıtları bul
    const overdueEntries = await this.calendarRepo
      .createQueryBuilder('entry')
      .where('entry.status = :status', { status: CashflowStatus.OVERDUE })
      .andWhere('entry.dailyInterestRate IS NOT NULL')
      .getMany();

    let interestApplied = 0;
    let skipped = 0;

    for (const entry of overdueEntries) {
      // BASİT FAİZ: her zaman originalAmount üzerinden (bileşik değil)
      const interest = Number(entry.originalAmount) * Number(entry.dailyInterestRate);
      const balanceBefore = Number(entry.currentAmount);
      const balanceAfter = balanceBefore + interest;

      // ON CONFLICT DO NOTHING: aynı gün için ikinci kez çalıştırılırsa (örn. n8n iki kez
      // tetiklerse) sessizce atlar, mükerrer faiz işlemez. RETURNING ile gerçekten eklenip
      // eklenmediğini anlıyoruz.
      const inserted = await this.dataSource.query(
        `INSERT INTO cashflow_interest_accruals
           (calendar_entry_id, accrual_date, interest_amount, balance_before, balance_after)
         VALUES ($1, CURRENT_DATE, $2, $3, $4)
         ON CONFLICT (calendar_entry_id, accrual_date) DO NOTHING
         RETURNING id`,
        [entry.id, interest, balanceBefore, balanceAfter],
      );

      if (inserted.length > 0) {
        await this.calendarRepo.update(entry.id, { currentAmount: balanceAfter });
        interestApplied++;
      } else {
        skipped++; // bugün için zaten işlenmiş
      }
    }

    return { markedOverdue, interestApplied, skipped };
  }
}
