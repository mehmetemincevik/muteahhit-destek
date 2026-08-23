import { IsNotEmpty, IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';

export class AddPortfolioImageDto {
  @IsUrl({}, { message: 'imageUrl geçerli bir URL olmalı' })
  @IsNotEmpty()
  imageUrl: string;

  @IsOptional()
  @IsUUID()
  packageId?: string;

  @IsOptional()
  @IsString()
  caption?: string;
}
