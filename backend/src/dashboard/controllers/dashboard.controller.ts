import {
  Controller,
  Get,
  Query,
  ForbiddenException,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { CacheTTL } from '@nestjs/cache-manager';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { Role } from '../../../generated/prisma/client.js';
import { HttpCacheInterceptor } from '../../common/interceptors/http-cache.interceptor.js';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';
import { DashboardQueryDto } from '../dto/dashboard-query.dto.js';
import { DashboardService } from '../services/dashboard.service.js';
import {
  DashboardOverviewDto,
  DashboardMembersDto,
  DashboardAttendanceDto,
  DashboardRevenueDto,
  DashboardSubscriptionsDto,
  DashboardTopMemberDto,
} from '../dto/responses.dto.js';

@Controller('dashboard')
@UseInterceptors(HttpCacheInterceptor)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @CacheTTL(60000) // 60 seconds
  @UseGuards(JwtAuthGuard)
  async getOverview(
    @CurrentUser() user: JwtPayload,
    @Query() query: DashboardQueryDto,
  ): Promise<DashboardOverviewDto> {
    return this.dashboardService.getOverview(this.getTenantId(user), query);
  }

  @Get('members')
  @CacheTTL(60000) // 60 seconds
  @UseGuards(JwtAuthGuard)
  async getMembersAnalytics(
    @CurrentUser() user: JwtPayload,
    @Query() query: DashboardQueryDto,
  ): Promise<DashboardMembersDto | { data: null; restricted: boolean }> {
    if (user.role === Role.TRAINER) {
      return { data: null, restricted: true };
    }
    return this.dashboardService.getMembersAnalytics(
      this.getTenantId(user),
      query,
    );
  }

  @Get('attendance')
  @CacheTTL(60000) // 60 seconds
  @UseGuards(JwtAuthGuard)
  async getAttendanceAnalytics(
    @CurrentUser() user: JwtPayload,
    @Query() query: DashboardQueryDto,
  ): Promise<DashboardAttendanceDto> {
    return this.dashboardService.getAttendanceAnalytics(
      this.getTenantId(user),
      query,
    );
  }

  @Get('revenue')
  @CacheTTL(60000) // 60 seconds
  @UseGuards(JwtAuthGuard)
  async getRevenueAnalytics(
    @CurrentUser() user: JwtPayload,
    @Query() query: DashboardQueryDto,
  ): Promise<DashboardRevenueDto | { data: null; restricted: boolean }> {
    if (user.role === Role.TRAINER) {
      return { data: null, restricted: true };
    }
    return this.dashboardService.getRevenueAnalytics(
      this.getTenantId(user),
      query,
    );
  }

  @Get('subscriptions')
  @CacheTTL(60000) // 60 seconds
  @UseGuards(JwtAuthGuard)
  async getSubscriptionsAnalytics(
    @CurrentUser() user: JwtPayload,
    @Query() query: DashboardQueryDto,
  ): Promise<DashboardSubscriptionsDto | { data: null; restricted: boolean }> {
    if (user.role === Role.TRAINER) {
      return { data: null, restricted: true };
    }
    return this.dashboardService.getSubscriptionsAnalytics(
      this.getTenantId(user),
      query,
    );
  }

  @Get('top-members')
  @CacheTTL(60000) // 60 seconds
  @UseGuards(JwtAuthGuard)
  async getTopMembers(
    @CurrentUser() user: JwtPayload,
    @Query() query: DashboardQueryDto,
  ): Promise<DashboardTopMemberDto[]> {
    return this.dashboardService.getTopMembers(this.getTenantId(user), query);
  }

  private getTenantId(user: JwtPayload): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant-scoped access is required');
    }
    return user.tenantId;
  }
}
