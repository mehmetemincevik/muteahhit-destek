import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBuyerDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'geçerli bir email adresi giriniz' })
  email?: string;

  @IsOptional()
  @IsString()
  tcOrVkn?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
