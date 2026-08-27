import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

// Kayıt isteğinin gövde şeması. Doğrulama main.ts'teki global ValidationPipe
// tarafından uygulanır.
//
// Sınırlama: telefon numarası biçim doğrulamasından geçmiyor, yalnızca boş olmaması
// kontrol ediliyor. Benzersizlik kontrolü servis katmanında yapılır.
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
