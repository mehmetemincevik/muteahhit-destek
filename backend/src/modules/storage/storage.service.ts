import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { unlink, writeFile } from 'fs/promises';
import { extname, join, normalize } from 'path';

// Yüklenen dosyaların diske yazılmasından ve erişim adresinin üretilmesinden sorumlu.
//
// Şu an dosyalar sunucunun yerel diskinde tutulur. Bu, tek sunuculu kurulumda yeterli;
// birden fazla instance çalıştırıldığında dosyalar örnekler arasında paylaşılmadığı için
// ortak bir depolamaya (S3 / R2 / MinIO) geçilmesi gerekir. Servisin arayüzü bu geçişi
// tek dosyada tutacak şekilde dar tutuldu: çağıranlar yalnızca save/delete biliyor.
@Injectable()
export class StorageService {
  private readonly uploadDir: string;
  private readonly publicBaseUrl: string;

  // Yalnızca görsel biçimleri kabul edilir. Kontrol hem MIME tipine hem uzantıya
  // bakar; istemciden gelen MIME tipi tek başına güvenilir değildir.
  private static readonly ALLOWED_MIME = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
  ]);
  private static readonly ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic']);

  static readonly MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || 'uploads';
    this.publicBaseUrl =
      this.configService.get<string>('PUBLIC_BASE_URL') || 'http://localhost:3000';

    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async save(file: Express.Multer.File, subdir: string): Promise<string> {
    if (!file) {
      throw new BadRequestException('Dosya gönderilmedi');
    }
    if (file.size > StorageService.MAX_FILE_SIZE) {
      throw new BadRequestException('Dosya boyutu 8 MB sınırını aşıyor');
    }

    const ext = extname(file.originalname).toLowerCase();
    if (!StorageService.ALLOWED_MIME.has(file.mimetype) || !StorageService.ALLOWED_EXT.has(ext)) {
      throw new BadRequestException('Yalnızca JPEG, PNG, WEBP ve HEIC görselleri yüklenebilir');
    }

    // Dosya adı istemciden gelmez; yol geçişi (../) ve isim çakışması riskini ortadan kaldırır.
    const fileName = `${randomUUID()}${ext}`;
    const targetDir = join(this.uploadDir, subdir);
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    await writeFile(join(targetDir, fileName), file.buffer);

    return `${this.publicBaseUrl}/uploads/${subdir}/${fileName}`;
  }

  // Kayıt silindiğinde dosyayı da temizler. Dosya bulunamazsa sessizce geçilir;
  // silme işleminin kayıt silmeyi engellememesi gerekir.
  async delete(fileUrl: string): Promise<void> {
    const prefix = `${this.publicBaseUrl}/uploads/`;
    if (!fileUrl.startsWith(prefix)) {
      return; // dış kaynaklı adres; bu servisin sorumluluğunda değil
    }

    const relativePath = fileUrl.slice(prefix.length);
    // normalize sonrası yolun hedef klasörün dışına çıkmadığı doğrulanır.
    const fullPath = normalize(join(this.uploadDir, relativePath));
    if (!fullPath.startsWith(normalize(this.uploadDir))) {
      return;
    }

    try {
      await unlink(fullPath);
    } catch {
      // Dosya zaten yok veya erişilemiyor; kayıt silme işlemi devam etmeli.
    }
  }
}
