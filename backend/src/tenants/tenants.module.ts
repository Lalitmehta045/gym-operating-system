// ============================================================================
// TenantsModule - Phase 2A tenant profile architecture boundary
// ============================================================================

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { TenantProfileController } from './controllers/tenant-profile.controller.js';
import { TenantProfileService } from './services/tenant-profile.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [TenantProfileController],
  providers: [TenantProfileService],
})
export class TenantsModule {}
