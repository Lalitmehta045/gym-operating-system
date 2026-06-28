import { Module } from '@nestjs/common';
import { MediaController } from './media.controller.js';
import { MediaService } from './media.service.js';
import { StorageService } from './storage.service.js';
import { TenantStorageModule } from '../storage/tenant-storage.module.js';

@Module({
  imports: [TenantStorageModule],
  controllers: [MediaController],
  providers: [MediaService, StorageService],
  exports: [MediaService, StorageService],
})
export class MediaModule {}
