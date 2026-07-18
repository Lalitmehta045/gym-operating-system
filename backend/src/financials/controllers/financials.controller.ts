import { Controller, Get, Param, Req, UseInterceptors, Query } from '@nestjs/common';
import { FinancialsService } from '../services/financials.service.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { Role } from '../../../generated/prisma/client.js';
import { SkipSubscriptionCheck } from '../../common/decorators/skip-subscription.decorator.js';
import { HttpCacheInterceptor } from '../../common/interceptors/http-cache.interceptor.js';

@Controller('financials')
@SkipSubscriptionCheck()
@Roles(Role.OWNER, Role.MANAGER, Role.SUPER_ADMIN)
@UseInterceptors(HttpCacheInterceptor)
export class FinancialsController {
  constructor(private readonly financialsService: FinancialsService) {}

  @Get('dashboard')
  async getDashboardMetrics(@Req() req: any, @Query() query: any) {
    const tenantId = req.tenantId || req.user?.tenantId;
    return this.financialsService.getDashboardMetrics(tenantId, query);
  }

  @Get('members/:memberId/ledger')
  async getMemberLedger(@Req() req: any, @Param('memberId') memberId: string) {
    const tenantId = req.tenantId || req.user?.tenantId;
    return this.financialsService.getMemberLedger(tenantId, memberId);
  }

  @Get('members/:memberId/summary')
  async getMemberSummary(@Req() req: any, @Param('memberId') memberId: string) {
    const tenantId = req.tenantId || req.user?.tenantId;
    return this.financialsService.getMemberSummary(tenantId, memberId);
  }

  @Get('invoices/:invoiceId/timeline')
  async getInvoiceTimeline(@Req() req: any, @Param('invoiceId') invoiceId: string) {
    const tenantId = req.tenantId || req.user?.tenantId;
    return this.financialsService.getInvoiceTimeline(tenantId, invoiceId);
  }
}
