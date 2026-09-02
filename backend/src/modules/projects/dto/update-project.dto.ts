import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ProjectStatus } from '../entities/project.entity';

// Kısmi güncelleme; gönderilmeyen alanlar mevcut değerini korur.
export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsDateString()
  estimatedOccupancyDate?: string;

  // Açık ilan, projeyi ustaların arama sonuçlarında görünür kılar. Yalnızca sınırlı
  // alanlar paylaşılır (bkz. public_project_listings view).
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  publicNote?: string;
}
