// ============================================================================
// PlatformController — Phase 9A Super Admin platform endpoints
// ============================================================================

import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { Role, AuditEntity, AuditAction } from '../../../generated/prisma/client.js';
import { AuditLog } from '../../audit/decorators/audit-log.decorator.js';
import { HttpCacheInterceptor } from '../../common/interceptors/http-cache.interceptor.js';
import { PlatformService } from '../services/platform.service.js';
import { TenantStorageService } from '../../storage/tenant-storage.service.js';
import {
  ListTenantsQueryDto,
  PlatformDashboardDto,
  PaginatedTenantsDto,
  TenantDetailDto,
  RevenueMetricsDto,
} from '../dto/platform.dto.js';

@Controller('platform')
@Roles(Role.SUPER_ADMIN)
@UseInterceptors(HttpCacheInterceptor)
export class PlatformController {
  constructor(
    private readonly platformService: PlatformService,
    private readonly storageService: TenantStorageService,
  ) {}

  @Get('dashboard')
  @CacheTTL(600) // 10 minutes
  async getDashboard(): Promise<PlatformDashboardDto> {
    return this.platformService.getPlatformDashboard();
  }

  @Get('tenants')
  @CacheTTL(600) // 10 minutes
  async getTenants(
    @Query() query: ListTenantsQueryDto,
  ): Promise<PaginatedTenantsDto> {
    return this.platformService.getTenants(query);
  }

  @Get('tenants/:id')
  @CacheTTL(600) // 10 minutes
  async getTenantById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) tenantId: string,
  ): Promise<TenantDetailDto> {
    return this.platformService.getTenantById(tenantId);
  }

  @Patch('tenants/:id/suspend')
  @AuditLog(AuditEntity.GYM, AuditAction.SUSPEND, '🚫 Tenant Suspended')
  async suspendTenant(
    @Param('id', new ParseUUIDPipe({ version: '4' })) tenantId: string,
  ): Promise<TenantDetailDto> {
    return this.platformService.suspendTenant(tenantId);
  }

  @Patch('tenants/:id/activate')
  @AuditLog(AuditEntity.GYM, AuditAction.ACTIVATE, '✅ Tenant Activated')
  async activateTenant(
    @Param('id', new ParseUUIDPipe({ version: '4' })) tenantId: string,
  ): Promise<TenantDetailDto> {
    return this.platformService.activateTenant(tenantId);
  }

  @Get('revenue')
  @CacheTTL(600) // 10 minutes
  async getRevenueMetrics(): Promise<RevenueMetricsDto> {
    return this.platformService.getRevenueMetrics();
  }

  @Get('storage')
  @CacheTTL(600) // 10 minutes
  async getStorageMetrics() {
    return this.storageService.getPlatformStorage();
  }
}
