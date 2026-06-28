import { Module } from '@nestjs/common';
import { TenantStorageService } from './tenant-storage.service.js';
import { TenantStorageController } from './tenant-storage.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { WhatsappModule } from '../whatsapp/whatsapp.module.js';

@Module({
  imports: [PrismaModule, NotificationsModule, WhatsappModule],
  controllers: [TenantStorageController],
  providers: [TenantStorageService],
  exports: [TenantStorageService],
})
export class TenantStorageModule {}
