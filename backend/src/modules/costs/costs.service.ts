import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CostCategory } from './entities/cost-category.entity';
import { CostItem } from './entities/cost-item.entity';
import { CostPayment } from './entities/cost-payment.entity';
import { AssetTransaction, AssetTransactionType } from '../assets/entities/asset-transaction.entity';
import { CreateCostCategoryDto } from './dto/create-cost-category.dto';
import { CreateCostItemDto } from './dto/create-cost-item.dto';
import { CreateCostPaymentDto } from './dto/create-cost-payment.dto';
import { ProjectsService } from '../projects/projects.service';

interface CostItemPaymentSummary {
  cost_item_id: string;
  total_cost: string;
  total_paid: string;
  remaining_balance: string;
  is_fully_paid: boolean;
}

interface ProjectCostSummaryRow {
  project_id: string;
  cost_type: string;
  category_name: string;
  category_total: string;
}

@Injectable()
export class CostsService {
  constructor(
    @InjectRepository(CostCategory) private readonly categoryRepo: Repository<CostCategory>,
    @InjectRepository(CostItem) private readonly costItemRepo: Repository<CostItem>,
    @InjectRepository(CostPayment) private readonly costPaymentRepo: Repository<CostPayment>,
    @InjectRepository(AssetTransaction)
    private readonly assetTransactionRepo: Repository<AssetTransaction>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly projectsService: ProjectsService,
  ) {}

  // Kategoriler ortak listedir; sahiplik kontrolü uygulanmaz (bkz. CostCategory).

  async createCategory(dto: CreateCostCategoryDto): Promise<CostCategory> {
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  async findCategories(): Promise<CostCategory[]> {
    return this.categoryRepo.find({ order: { name: 'ASC' } });
  }

  // Maliyet kalemleri projeye bağlıdır; her işlemde proje sahipliği doğrulanır.

  async createCostItem(
    contractorId: string,
    projectId: string,
    dto: CreateCostItemDto,
  ): Promise<CostItem> {
    // projectId doğrudan mevcut; sahiplik ProjectsService üzerinden doğrulanır.
    await this.projectsService.findOneForContractor(projectId, contractorId);

    const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
    if (!category) {
      throw new NotFoundException('Maliyet kategorisi bulunamadı');
    }

    const costItem = this.costItemRepo.create({
      projectId,
      categoryId: dto.categoryId,
      name: dto.name,
      quantity: dto.quantity,
      unit: dto.unit,
      unitPrice: dto.unitPrice,
      totalCost: dto.totalCost,
      source: dto.source,
      extraSpecs: dto.extraSpecs,
      incurredDate: dto.incurredDate ? new Date(dto.incurredDate) : undefined,
    });
    return this.costItemRepo.save(costItem);
  }

  async findCostItemsByProject(contractorId: string, projectId: string): Promise<CostItem[]> {
    await this.projectsService.findOneForContractor(projectId, contractorId);
    return this.costItemRepo.find({
      where: { projectId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  // Kategori bazında toplamlar. project_cost_summary bir view olduğu için repository
  // yerine parametreli ham sorgu kullanılır.
  async getProjectCostSummary(
    contractorId: string,
    projectId: string,
  ): Promise<ProjectCostSummaryRow[]> {
    await this.projectsService.findOneForContractor(projectId, contractorId);
    return this.dataSource.query(
      'SELECT * FROM project_cost_summary WHERE project_id = $1 ORDER BY cost_type, category_name',
      [projectId],
    );
  }

  // --- Maliyet Ödemeleri: cost_item'a bağlı, yetki kontrolü zincir üzerinden ---

  // Yalnızca costItemId bilindiğinde sahiplik, kalem -> proje ilişkisi üzerinden doğrulanır.
  private async assertCostItemOwnership(contractorId: string, costItemId: string): Promise<CostItem> {
    const costItem = await this.costItemRepo.findOne({
      where: { id: costItemId },
      relations: ['project'],
    });
    if (!costItem) {
      throw new NotFoundException('Maliyet kalemi bulunamadı');
    }
    if (costItem.project.contractorId !== contractorId) {
      throw new ForbiddenException('Bu maliyet kalemine erişim yetkiniz yok');
    }
    return costItem;
  }

  async createCostPayment(
    contractorId: string,
    costItemId: string,
    dto: CreateCostPaymentDto,
  ): Promise<CostPayment> {
    await this.assertCostItemOwnership(contractorId, costItemId);

    const payment = this.costPaymentRepo.create({
      costItemId,
      amount: dto.amount,
      paymentDate: new Date(dto.paymentDate),
      paymentMethod: dto.paymentMethod,
      note: dto.note,
    });
    const saved = await this.costPaymentRepo.save(payment);

    // Deftere çıkış olarak yazılır; tutar negatif işaretlenir.
    await this.assetTransactionRepo.save(
      this.assetTransactionRepo.create({
        contractorId,
        transactionType: AssetTransactionType.COST_PAYMENT,
        amount: -dto.amount,
        sourceTable: 'cost_payments',
        sourceId: saved.id,
        transactionDate: new Date(dto.paymentDate),
      }),
    );

    return saved;
  }

  async getCostItemBalance(
    contractorId: string,
    costItemId: string,
  ): Promise<CostItemPaymentSummary> {
    await this.assertCostItemOwnership(contractorId, costItemId);

    const rows: CostItemPaymentSummary[] = await this.dataSource.query(
      'SELECT * FROM cost_item_payment_summary WHERE cost_item_id = $1',
      [costItemId],
    );
    if (!rows.length) {
      throw new NotFoundException('Bu maliyet kalemi için bakiye bilgisi bulunamadı');
    }
    return rows[0];
  }
}
