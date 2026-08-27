import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Asset, AssetType } from './entities/asset.entity';
import { AssetRental } from './entities/asset-rental.entity';
import { RentalPayment } from './entities/rental-payment.entity';
import { AssetValueSnapshot } from './entities/asset-value-snapshot.entity';
import { AssetTransaction, AssetTransactionType } from './entities/asset-transaction.entity';
import { CreateAssetDto } from './dto/create-asset.dto';
import { CreateManualTransactionDto } from './dto/create-manual-transaction.dto';
import { CreateRentalDto } from './dto/create-rental.dto';
import { CreateRentalPaymentDto } from './dto/create-rental-payment.dto';
import { CreateValueSnapshotDto } from './dto/create-value-snapshot.dto';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset) private readonly assetRepo: Repository<Asset>,
    @InjectRepository(AssetRental) private readonly rentalRepo: Repository<AssetRental>,
    @InjectRepository(RentalPayment) private readonly rentalPaymentRepo: Repository<RentalPayment>,
    @InjectRepository(AssetValueSnapshot)
    private readonly snapshotRepo: Repository<AssetValueSnapshot>,
    @InjectRepository(AssetTransaction)
    private readonly transactionRepo: Repository<AssetTransaction>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  private async assertAssetOwnership(contractorId: string, assetId: string): Promise<Asset> {
    const asset = await this.assetRepo.findOne({ where: { id: assetId } });
    if (!asset) {
      throw new NotFoundException('Varlık bulunamadı');
    }
    if (asset.contractorId !== contractorId) {
      throw new ForbiddenException('Bu varlığa erişim yetkiniz yok');
    }
    return asset;
  }

  // Nakit ve emtia bakiyesi, varlığa ait tüm hareketlerin toplamıdır. Her hareket
  // sonrası baştan hesaplanır; artımlı güncelleme yapılmaz, böylece kayıt silme veya
  // düzeltme durumunda değer sapmaz.
  private async recomputeCashCommodityValue(assetId: string): Promise<void> {
    const rows: { total: string }[] = await this.dataSource.query(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM asset_transactions WHERE asset_id = $1',
      [assetId],
    );
    await this.assetRepo.update(assetId, {
      currentValue: parseFloat(rows[0].total),
      valueUpdatedAt: new Date(),
    });
  }

  async createAsset(contractorId: string, dto: CreateAssetDto): Promise<Asset> {
    const asset = this.assetRepo.create({
      contractorId,
      assetType: dto.assetType,
      name: dto.name,
      description: dto.description,
      province: dto.province,
      district: dto.district,
      roomLayout: dto.roomLayout,
      areaM2: dto.areaM2,
    });
    return this.assetRepo.save(asset);
  }

  async findAssetsForContractor(contractorId: string): Promise<Asset[]> {
    return this.assetRepo.find({ where: { contractorId }, order: { createdAt: 'DESC' } });
  }

  async getAssetDetail(contractorId: string, assetId: string) {
    const asset = await this.assertAssetOwnership(contractorId, assetId);
    const transactions = await this.transactionRepo.find({
      where: { assetId },
      order: { transactionDate: 'DESC' },
    });
    const rentals = await this.rentalRepo.find({ where: { assetId } });
    const snapshots = await this.snapshotRepo.find({
      where: { assetId },
      order: { snapshotDate: 'DESC' },
    });
    return { asset, transactions, rentals, snapshots };
  }

  // Manuel hareketler: uygulama akışları dışında oluşan giriş ve çıkışlar.

  async addManualTransaction(
    contractorId: string,
    assetId: string,
    dto: CreateManualTransactionDto,
  ): Promise<AssetTransaction> {
    await this.assertAssetOwnership(contractorId, assetId);

    // DTO her zaman pozitif tutar taşır; işaret yön alanından türetilir.
    const signedAmount = dto.direction === 'manual_addition' ? dto.amount : -dto.amount;

    const transaction = this.transactionRepo.create({
      contractorId,
      assetId,
      transactionType:
        dto.direction === 'manual_addition'
          ? AssetTransactionType.MANUAL_ADDITION
          : AssetTransactionType.MANUAL_DEDUCTION,
      amount: signedAmount,
      transactionDate: new Date(dto.transactionDate),
      description: dto.description,
    });
    const saved = await this.transactionRepo.save(transaction);

    await this.recomputeCashCommodityValue(assetId);
    return saved;
  }

  // --- Kira ---

  async createRental(
    contractorId: string,
    assetId: string,
    dto: CreateRentalDto,
  ): Promise<AssetRental> {
    const asset = await this.assertAssetOwnership(contractorId, assetId);

    if (asset.assetType !== AssetType.REAL_ESTATE) {
      throw new BadRequestException('Sadece real_estate tipi varlıklar kiraya verilebilir');
    }

    const rental = this.rentalRepo.create({
      assetId,
      tenantName: dto.tenantName,
      tenantPhone: dto.tenantPhone,
      monthlyRent: dto.monthlyRent,
      contractStartDate: dto.contractStartDate ? new Date(dto.contractStartDate) : undefined,
      contractEndDate: dto.contractEndDate ? new Date(dto.contractEndDate) : undefined,
    });
    const saved = await this.rentalRepo.save(rental);

    // Varlık üzerindeki kira durumu işaretlenir; liste ekranlarında filtreleme için kullanılır.
    //
    // Sınırlama: sözleşme pasifleştirildiğinde bu bayrak geri alınmıyor.
    await this.assetRepo.update(assetId, { isGeneratingRentalIncome: true });

    return saved;
  }

  private async assertRentalOwnership(contractorId: string, rentalId: string): Promise<AssetRental> {
    const rental = await this.rentalRepo.findOne({ where: { id: rentalId }, relations: ['asset'] });
    if (!rental) {
      throw new NotFoundException('Kira sözleşmesi bulunamadı');
    }
    if (rental.asset.contractorId !== contractorId) {
      throw new ForbiddenException('Bu kira sözleşmesine erişim yetkiniz yok');
    }
    return rental;
  }

  async addRentalPayment(
    contractorId: string,
    rentalId: string,
    dto: CreateRentalPaymentDto,
  ): Promise<RentalPayment> {
    const rental = await this.assertRentalOwnership(contractorId, rentalId);

    const payment = this.rentalPaymentRepo.create({
      rentalId,
      amount: dto.amount,
      paymentDate: new Date(dto.paymentDate),
      note: dto.note,
    });
    const saved = await this.rentalPaymentRepo.save(payment);

    // Kira geliri deftere yazılır ancak mülkün currentValue'sunu değiştirmez.
    // Mülk değeri yalnızca değerleme kayıtlarından gelir; kira birikimi değere eklenirse
    // varlık değeri yanlış şişer.
    await this.transactionRepo.save(
      this.transactionRepo.create({
        contractorId,
        assetId: rental.assetId,
        transactionType: AssetTransactionType.RENTAL_INCOME,
        amount: dto.amount,
        sourceTable: 'rental_payments',
        sourceId: saved.id,
        transactionDate: new Date(dto.paymentDate),
      }),
    );

    return saved;
  }

  // Mülk değerleme kayıtları.

  async addValueSnapshot(
    contractorId: string,
    assetId: string,
    dto: CreateValueSnapshotDto,
  ): Promise<AssetValueSnapshot> {
    const asset = await this.assertAssetOwnership(contractorId, assetId);

    if (asset.assetType !== AssetType.REAL_ESTATE) {
      throw new BadRequestException('Değer anlık görüntüsü sadece real_estate tipi varlıklar içindir');
    }

    const snapshot = this.snapshotRepo.create({
      assetId,
      estimatedValue: dto.estimatedValue,
      snapshotDate: new Date(dto.snapshotDate),
      source: dto.source,
    });
    const saved = await this.snapshotRepo.save(snapshot);

    // Mülkte currentValue en son değerleme kaydından gelir; hareket toplamı kullanılmaz.
    await this.assetRepo.update(assetId, {
      currentValue: dto.estimatedValue,
      valueUpdatedAt: new Date(),
    });

    return saved;
  }
}
