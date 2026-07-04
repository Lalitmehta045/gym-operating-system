import { Module } from '@nestjs/common';
import { MediaController } from './media.controller.js';
import { MediaService } from './media.service.js';
import { StorageService } from './storage.service.js';
import { TenantStorageModule } from '../storage/tenant-storage.module.js';
import { ImageProcessingProcessor } from './processors/image-processing.processor.js';

@Module({
  imports: [TenantStorageModule],
  controllers: [MediaController],
  providers: [MediaService, StorageService, ImageProcessingProcessor],
  exports: [MediaService, StorageService],
})
export class MediaModule {}
