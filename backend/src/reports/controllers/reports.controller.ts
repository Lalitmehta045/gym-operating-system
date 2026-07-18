import {
  Controller,
  Get,
  Query,
  ForbiddenException,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { ReportsService } from '../services/reports.service.js';
import { ExpiringMembersQueryDto } from '../dto/expiring-members-query.dto.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Role } from '../../../generated/prisma/client.js';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';

@Controller('reports')
@Roles(Role.OWNER, Role.MANAGER)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  private getTenantId(user: JwtPayload): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant-scoped access is required');
    }
    return user.tenantId;
  }

  @Get('dashboard')
  getDashboardAnalytics(@CurrentUser() user: JwtPayload) {
    return this.reportsService.getDashboardAnalytics(this.getTenantId(user));
  }

  @Get('export/pdf')
  async exportPdfReport(
    @CurrentUser() user: JwtPayload,
    @Query('type') type: string,
    @Res() res: any,
  ) {
    const reportType = type || 'dashboard';
    return this.reportsService.generatePdfReport(this.getTenantId(user), reportType, res);
  }

  @Get('revenue')
  getRevenueReport(@CurrentUser() user: JwtPayload) {
    return this.reportsService.getRevenueReport(this.getTenantId(user));
  }

  @Get('subscriptions')
  getSubscriptionReport(@CurrentUser() user: JwtPayload) {
    return this.reportsService.getSubscriptionReport(this.getTenantId(user));
  }

  @Get('expiring-members')
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
