import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CraftsmanProfile } from './entities/craftsman-profile.entity';
import { CraftsmanServicePackage } from './entities/craftsman-service-package.entity';
import { ServicePackageItem } from './entities/service-package-item.entity';
import { CraftsmanPortfolioImage } from './entities/craftsman-portfolio-image.entity';
import { CraftsmanReview } from './entities/craftsman-review.entity';
import {
  ProjectCraftsmanAssignment,
  AssignmentStatus,
} from './entities/project-craftsman-assignment.entity';
import { UpsertProfileDto } from './dto/upsert-profile.dto';
import { CreatePackageDto } from './dto/create-package.dto';
import { CreatePackageItemDto } from './dto/create-package-item.dto';
import { AddPortfolioImageDto } from './dto/add-portfolio-image.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentStatusDto } from './dto/update-assignment-status.dto';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class CraftsmenService {
  constructor(
    @InjectRepository(CraftsmanProfile) private readonly profileRepo: Repository<CraftsmanProfile>,
    @InjectRepository(CraftsmanServicePackage)
    private readonly packageRepo: Repository<CraftsmanServicePackage>,
    @InjectRepository(ServicePackageItem)
    private readonly packageItemRepo: Repository<ServicePackageItem>,
    @InjectRepository(CraftsmanPortfolioImage)
    private readonly portfolioRepo: Repository<CraftsmanPortfolioImage>,
    @InjectRepository(CraftsmanReview) private readonly reviewRepo: Repository<CraftsmanReview>,
    @InjectRepository(ProjectCraftsmanAssignment)
    private readonly assignmentRepo: Repository<ProjectCraftsmanAssignment>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly projectsService: ProjectsService,
  ) {}

  // --- Profil: UPSERT deseni (varsa güncelle, yoksa oluştur) ---

  async upsertProfile(userId: string, dto: UpsertProfileDto): Promise<CraftsmanProfile> {
    let profile = await this.profileRepo.findOne({ where: { userId } });

    if (profile) {
      // Zaten var -> alanları güncelle
      Object.assign(profile, dto);
    } else {
      // Yok -> yeni oluştur
      profile = this.profileRepo.create({ userId, ...dto });
    }
    return this.profileRepo.save(profile);
  }

  async getMyProfile(userId: string): Promise<CraftsmanProfile> {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Henüz bir usta profili oluşturmadınız');
    }
    return profile;
  }

  // Müteahhitlerin usta aramasına yönelik genel liste -- yetki kısıtı YOK (herkese açık bilgi)
  async findAllProfiles(filters?: { province?: string; district?: string }): Promise<CraftsmanProfile[]> {
    const query = this.profileRepo.createQueryBuilder('profile');
    if (filters?.province) {
      query.andWhere('profile.province = :province', { province: filters.province });
    }
    if (filters?.district) {
      query.andWhere('profile.district = :district', { district: filters.district });
    }
    return query.orderBy('profile.averageRating', 'DESC').getMany();
  }

  // Bir ustanın tam profilini (paketler, portfolyo, yorumlar dahil) herkes görebilir
  async getProfileDetail(craftsmanId: string) {
    const profile = await this.profileRepo.findOne({ where: { id: craftsmanId } });
    if (!profile) {
      throw new NotFoundException('Usta bulunamadı');
    }
    const packages = await this.packageRepo.find({
      where: { craftsmanId, isActive: true },
      relations: ['items'],
    });
    const portfolioImages = await this.portfolioRepo.find({ where: { craftsmanId } });
    const reviews = await this.reviewRepo.find({
      where: { craftsmanId },
      order: { createdAt: 'DESC' },
    });
    return { profile, packages, portfolioImages, reviews };
  }

  private async getOwnCraftsmanId(userId: string): Promise<string> {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      throw new BadRequestException('Önce bir usta profili oluşturmalısınız');
    }
    return profile.id;
  }

  // --- Hizmet Paketleri ---

  async createPackage(userId: string, dto: CreatePackageDto): Promise<CraftsmanServicePackage> {
    const craftsmanId = await this.getOwnCraftsmanId(userId);
    const pkg = this.packageRepo.create({ craftsmanId, ...dto });
    return this.packageRepo.save(pkg);
  }

  private async assertPackageOwnership(
    userId: string,
    packageId: string,
  ): Promise<CraftsmanServicePackage> {
    const pkg = await this.packageRepo.findOne({ where: { id: packageId }, relations: ['craftsman'] });
    if (!pkg) {
      throw new NotFoundException('Hizmet paketi bulunamadı');
    }
    if (pkg.craftsman.userId !== userId) {
      throw new ForbiddenException('Bu pakete erişim yetkiniz yok');
    }
    return pkg;
  }

  async addPackageItem(
    userId: string,
    packageId: string,
    dto: CreatePackageItemDto,
  ): Promise<ServicePackageItem> {
    await this.assertPackageOwnership(userId, packageId);
    const item = this.packageItemRepo.create({ packageId, ...dto });
    return this.packageItemRepo.save(item);
  }

  // --- Portfolyo ---

  async addPortfolioImage(
    userId: string,
    dto: AddPortfolioImageDto,
  ): Promise<CraftsmanPortfolioImage> {
    const craftsmanId = await this.getOwnCraftsmanId(userId);
    const image = this.portfolioRepo.create({ craftsmanId, ...dto });
    return this.portfolioRepo.save(image);
  }

  // --- Yorumlar (müteahhit ustayı değerlendiriyor) ---

  async createReview(contractorId: string, dto: CreateReviewDto): Promise<CraftsmanReview> {
    // Eğer projectId verildiyse, bu ustanın gerçekten o projede çalıştığını doğrula --
    // rastgele bir ustaya, hiç çalışmadığı bir proje üzerinden sahte yorum yazılamasın.
    if (dto.projectId) {
      const assignment = await this.assignmentRepo.findOne({
        where: { projectId: dto.projectId, craftsmanId: dto.craftsmanId },
        relations: ['project'],
      });
      if (!assignment || assignment.project.contractorId !== contractorId) {
        throw new BadRequestException(
          'Bu usta, belirtilen projede sizinle çalışmamış görünüyor',
        );
      }
    }

    const review = this.reviewRepo.create({ contractorId, ...dto });
    const saved = await this.reviewRepo.save(review);

    await this.recomputeRating(dto.craftsmanId);
    return saved;
  }

  private async recomputeRating(craftsmanId: string): Promise<void> {
    const rows: { avg: string | null; count: string }[] = await this.dataSource.query(
      'SELECT AVG(rating) as avg, COUNT(*) as count FROM craftsman_reviews WHERE craftsman_id = $1',
      [craftsmanId],
    );
    await this.profileRepo.update(craftsmanId, {
      averageRating: rows[0].avg ? parseFloat(rows[0].avg) : 0,
      reviewCount: parseInt(rows[0].count, 10),
    });
  }

  // --- Proje Atamaları ---

  async createAssignment(
    contractorId: string,
    projectId: string,
    dto: CreateAssignmentDto,
  ): Promise<ProjectCraftsmanAssignment> {
    await this.projectsService.findOneForContractor(projectId, contractorId);

    const assignment = this.assignmentRepo.create({
      projectId,
      craftsmanId: dto.craftsmanId,
      packageId: dto.packageId,
      agreedPrice: dto.agreedPrice,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      notes: dto.notes,
    });
    return this.assignmentRepo.save(assignment);
  }

  async findAssignmentsByProject(
    contractorId: string,
    projectId: string,
  ): Promise<ProjectCraftsmanAssignment[]> {
    await this.projectsService.findOneForContractor(projectId, contractorId);
    return this.assignmentRepo.find({
      where: { projectId },
      relations: ['craftsman'],
    });
  }

  // Usta kendi aktif/geçmiş projelerini görür
  async findAssignmentsForCraftsman(userId: string): Promise<ProjectCraftsmanAssignment[]> {
    const craftsmanId = await this.getOwnCraftsmanId(userId);
    return this.assignmentRepo.find({
      where: { craftsmanId },
      relations: ['project'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateAssignmentStatus(
    contractorId: string,
    assignmentId: string,
    dto: UpdateAssignmentStatusDto,
  ): Promise<ProjectCraftsmanAssignment> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ['project'],
    });
    if (!assignment) {
      throw new NotFoundException('Atama bulunamadı');
    }
    if (assignment.project.contractorId !== contractorId) {
      throw new ForbiddenException('Bu atamaya erişim yetkiniz yok');
    }

    assignment.status = dto.status;
    if (dto.endDate) {
      assignment.endDate = new Date(dto.endDate);
    }
    return this.assignmentRepo.save(assignment);
  }
}
