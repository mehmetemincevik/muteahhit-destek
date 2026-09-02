import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service';

// Global: dosya yükleyen her modülde ayrıca import edilmesine gerek kalmaz.
@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
