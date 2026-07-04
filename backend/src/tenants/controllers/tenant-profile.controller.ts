// ============================================================================
// TenantProfileController - Phase 2B tenant profile API
// ============================================================================

import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { Role } from '../../../generated/prisma/client.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { HttpCacheInterceptor } from '../../common/interceptors/http-cache.interceptor.js';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';
import { TenantProfileDto } from '../dto/tenant-profile.dto.js';
import { UpdateTenantProfileDto } from '../dto/update-tenant-profile.dto.js';
import { TenantProfileService } from '../services/tenant-profile.service.js';

@Controller('tenant/profile')
@UseInterceptors(HttpCacheInterceptor)
export class TenantProfileController {
  constructor(private readonly tenantProfileService: TenantProfileService) {}

  @Get()
  @CacheTTL(600000) // 10 minutes
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  async getProfile(@CurrentUser() user: JwtPayload): Promise<TenantProfileDto> {
    return this.tenantProfileService.getTenantProfile(this.getTenantId(user));
  }

  @Patch()
  @Roles(Role.OWNER, Role.MANAGER)
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateTenantProfileDto,
  ): Promise<TenantProfileDto> {
    return this.tenantProfileService.updateTenantProfile(
      this.getTenantId(user),
      dto,
    );
  }

  private getTenantId(user: JwtPayload): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant-scoped access is required');
    }

    return user.tenantId;
  }
}
