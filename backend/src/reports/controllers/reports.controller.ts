import {
  Controller,
  Get,
  Query,
  ForbiddenException,
  UseInterceptors,
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { ReportsService } from '../services/reports.service.js';
import { ExpiringMembersQueryDto } from '../dto/expiring-members-query.dto.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Role } from '../../../generated/prisma/client.js';
import { HttpCacheInterceptor } from '../../common/interceptors/http-cache.interceptor.js';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';

@Controller('reports')
@Roles(Role.OWNER, Role.MANAGER)
@UseInterceptors(HttpCacheInterceptor)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  private getTenantId(user: JwtPayload): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant-scoped access is required');
    }
    return user.tenantId;
  }

  @Get('revenue')
  @CacheTTL(60000) // 1 minute
  getRevenueReport(@CurrentUser() user: JwtPayload) {
    return this.reportsService.getRevenueReport(this.getTenantId(user));
  }

  @Get('subscriptions')
  @CacheTTL(60000) // 1 minute
  getSubscriptionReport(@CurrentUser() user: JwtPayload) {
    return this.reportsService.getSubscriptionReport(this.getTenantId(user));
  }

  @Get('expiring-members')
  @CacheTTL(60000) // 1 minute
  getExpiringMembersReport(
    @CurrentUser() user: JwtPayload,
    @Query() query: ExpiringMembersQueryDto,
  ) {
    return this.reportsService.getExpiringMembersReport(
      this.getTenantId(user),
      query,
    );
  }
}
