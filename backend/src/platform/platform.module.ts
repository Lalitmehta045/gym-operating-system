// ============================================================================
// PlatformModule — Phase 9A Super Admin platform visibility
// ============================================================================

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PlatformController } from './controllers/platform.controller.js';
import { PlatformService } from './services/platform.service.js';
import { TenantStorageModule } from '../storage/tenant-storage.module.js';

@Module({
  imports: [PrismaModule, TenantStorageModule],
  controllers: [PlatformController],
  providers: [PlatformService],
  exports: [PlatformService],
})
export class PlatformModule {}
