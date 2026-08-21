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

  // Proje + arsa + arsa sahiplerini TEK bir veritabanı işleminde (transaction) oluşturur.
  // Neden transaction? Örneğin arsa sahibi eklerken bir hata olursa, yarım kalmış bir proje
  // veritabanında kalmamalı -- ya hepsi başarılı olur, ya da hiçbiri kaydedilmez.
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

      // Arsa bilgisi verilmişse (en azından bir alan doluysa) land kaydı oluştur
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

  // Sadece giriş yapan müteahhidin KENDİ projelerini listeler
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

    // Yetkilendirme kontrolü: başka bir müteahhidin projesine erişim engellensin
    if (project.contractorId !== contractorId) {
      throw new ForbiddenException('Bu projeye erişim yetkiniz yok');
    }

    return project;
  }
}
