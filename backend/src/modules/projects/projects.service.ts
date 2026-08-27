import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { Land } from './entities/land.entity';
import { LandOwner } from './entities/land-owner.entity';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
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

      // Arsa alanlarından en az biri doluysa land kaydı açılır.
      const hasLandInfo =
        dto.province || dto.district || dto.areaM2 || dto.purchasePrice || dto.adaNo;

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
}
