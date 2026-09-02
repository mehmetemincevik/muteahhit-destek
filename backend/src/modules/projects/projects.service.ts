import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { Land } from './entities/land.entity';
import { LandOwner } from './entities/land-owner.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { LandOwnerDto } from './dto/land-owner.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(Land) private readonly landRepo: Repository<Land>,
    @InjectRepository(LandOwner) private readonly landOwnerRepo: Repository<LandOwner>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  // Proje, arsa ve arsa sahipleri tek transaction içinde oluşturulur; ara adımlardan
  // birinde hata olursa yarım kayıt kalmaz.
  async create(contractorId: string, dto: CreateProjectDto): Promise<Project> {
    return this.dataSource.transaction(async (manager) => {
      const project = manager.create(Project, {
        contractorId,
        name: dto.name,
        estimatedOccupancyDate: dto.estimatedOccupancyDate
          ? new Date(dto.estimatedOccupancyDate)
          : undefined,
      });
      await manager.save(project);

      // Arsa bilgisi veya arsa sahibi girildiyse land kaydı açılır. Sahipler land'e bağlı
      // olduğu için, yalnızca sahip girilen (konum/bedel girilmeyen) kat karşılığı
      // projelerde de kayıt oluşturulmalı; aksi halde sahipler sessizce kaybolur.
      const hasLandInfo =
        dto.province ||
        dto.district ||
        dto.areaM2 ||
        dto.purchasePrice ||
        dto.adaNo ||
        dto.isKatKarsiligi ||
        (dto.owners?.length ?? 0) > 0;

      if (hasLandInfo) {
        const land = manager.create(Land, {
          projectId: project.id,
          province: dto.province,
          district: dto.district,
          neighborhood: dto.neighborhood,
          adaNo: dto.adaNo,
          parselNo: dto.parselNo,
          areaM2: dto.areaM2,
          purchasePrice: dto.purchasePrice,
          isKatKarsiligi: dto.isKatKarsiligi ?? false,
        });
        await manager.save(land);

        if (dto.owners?.length) {
          const owners = dto.owners.map((o) =>
            manager.create(LandOwner, {
              landId: land.id,
              fullName: o.fullName,
              phone: o.phone,
              sharePercentage: o.sharePercentage,
              tcOrVkn: o.tcOrVkn,
            }),
          );
          await manager.save(owners);
        }
      }

      return project;
    });
  }

  // Yalnızca istek sahibinin projeleri döner.
  async findAllForContractor(contractorId: string): Promise<Project[]> {
    return this.projectRepo.find({
      where: { contractorId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForContractor(id: string, contractorId: string): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['blocks', 'blocks.units'],
    });

    if (!project) {
      throw new NotFoundException('Proje bulunamadı');
    }

    // Sahiplik kontrolü. Bu metot diğer servislerde de yetki doğrulaması için
    // çağrılır (UnitsService, CostsService, CraftsmenService).
    if (project.contractorId !== contractorId) {
      throw new ForbiddenException('Bu projeye erişim yetkiniz yok');
    }

    return project;
  }

  async update(contractorId: string, id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOneForContractor(id, contractorId);

    if (dto.name !== undefined) project.name = dto.name;
    if (dto.status !== undefined) project.status = dto.status;
    if (dto.estimatedOccupancyDate !== undefined) {
      project.estimatedOccupancyDate = new Date(dto.estimatedOccupancyDate);
    }
    if (dto.isPublic !== undefined) project.isPublic = dto.isPublic;
    if (dto.publicNote !== undefined) project.publicNote = dto.publicNote;

    return this.projectRepo.save(project);
  }

  // Projenin arsa sahipleri. Kat karşılığı daire teslimi bu kayıtlara bağlandığı için
  // (units.land_owner_id) seçim ekranlarında listelenir.
  async findLandOwners(contractorId: string, projectId: string): Promise<LandOwner[]> {
    await this.findOneForContractor(projectId, contractorId);

    const land = await this.landRepo.findOne({ where: { projectId } });
    if (!land) {
      // Arsa kaydı olmayan projede sahip de yoktur; hata yerine boş liste dönmek
      // çağıran ekranların ayrı bir durum yönetmesini gereksiz kılıyor.
      return [];
    }
    return this.landOwnerRepo.find({ where: { landId: land.id }, order: { fullName: 'ASC' } });
  }

  // Proje oluşturulduktan sonra arsa sahibi eklemek için. Arsa kaydı yoksa oluşturulur;
  // hisseli tapularda sahiplerin sonradan girilmesi yaygın.
  async addLandOwner(
    contractorId: string,
    projectId: string,
    dto: LandOwnerDto,
  ): Promise<LandOwner> {
    await this.findOneForContractor(projectId, contractorId);

    let land = await this.landRepo.findOne({ where: { projectId } });
    if (!land) {
      land = await this.landRepo.save(this.landRepo.create({ projectId }));
    }

    const owner = this.landOwnerRepo.create({ landId: land.id, ...dto });
    return this.landOwnerRepo.save(owner);
  }

  // Bir arsa sahibi kaydının bu müteahhide ait olup olmadığını doğrular.
  // UnitsService, daireyi arsa sahibine devrederken bu kontrolü kullanır.
  async assertLandOwnerBelongsToContractor(
    contractorId: string,
    landOwnerId: string,
  ): Promise<void> {
    const owner = await this.landOwnerRepo.findOne({
      where: { id: landOwnerId },
      relations: ['land', 'land.project'],
    });
    if (!owner || owner.land.project.contractorId !== contractorId) {
      throw new ForbiddenException('Bu arsa sahibi kaydına erişim yetkiniz yok');
    }
  }

  // Ustalara açık ilan listesi. public_project_listings view'ı yalnızca tanıtıcı alanları
  // içerir; maliyet, satış fiyatı ve arsa bedeli gibi finansal veriler dışarıda kalır.
  async findPublicListings(): Promise<unknown[]> {
    return this.dataSource.query(
      'SELECT * FROM public_project_listings ORDER BY estimated_occupancy_date NULLS LAST',
    );
  }
}
