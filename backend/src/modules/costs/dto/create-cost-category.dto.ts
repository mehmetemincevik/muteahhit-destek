import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CostType } from '../entities/cost-category.entity';

export class CreateCostCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(CostType)
  costType: CostType;
}
