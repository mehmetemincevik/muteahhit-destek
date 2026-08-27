import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicePackageTemplate } from './entities/service-package-template.entity';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(ServicePackageTemplate)
    private readonly templateRepo: Repository<ServicePackageTemplate>,
  ) {}

  // Şablonlar salt okunurdur; kayıtlar migration ile yüklenir (08_templates.sql).
  // Yeni şablon eklemek için migration yazılması gerekir.
  async findAll(): Promise<ServicePackageTemplate[]> {
    return this.templateRepo.find({
      where: { isActive: true },
      relations: ['items'],
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ServicePackageTemplate> {
    const template = await this.templateRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!template) {
      throw new NotFoundException('Şablon bulunamadı');
    }
    return template;
  }
}
