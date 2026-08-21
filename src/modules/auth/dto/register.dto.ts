import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

// DTO (Data Transfer Object) = dışarıdan gelen isteğin şeklini ve kurallarını tanımlar.
// class-validator decorator'ları sayesinde main.ts'teki ValidationPipe bunu otomatik kontrol eder.
export class RegisterDto {
  @IsEnum(UserRole, { message: 'role sadece "contractor" veya "craftsman" olabilir' })
  role: UserRole;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsEmail({}, { message: 'geçerli bir email adresi giriniz' })
  email?: string;

  @IsString()
  @MinLength(6, { message: 'şifre en az 6 karakter olmalı' })
  password: string;
}
