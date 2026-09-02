import { IsOptional, IsString, IsUUID } from 'class-validator';

// Dosya yüklemeli portfolyo eklemede kullanılır. Görsel adresi sunucuda üretildiği için
// istemciden alınmaz; yalnızca ek alanlar gönderilir.
//
// Alanlar multipart/form-data ile geldiği için metin olarak taşınır; boş dize
// gönderilmesi durumunda değer yok sayılır (bkz. controller).
export class UploadPortfolioImageDto {
  @IsOptional()
  @IsUUID()
  packageId?: string;

  @IsOptional()
  @IsString()
  caption?: string;
}
