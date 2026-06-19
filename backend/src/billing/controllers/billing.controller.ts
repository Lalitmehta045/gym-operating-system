import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { BillingService } from '../services/billing.service.js';
import { UpgradePlanDto, ListInvoicesQueryDto } from '../dto/billing.dto.js';
import { VerifyTenantPaymentDto } from '../../razorpay/dto/verify-tenant-payment.dto.js';
import { SkipSubscriptionCheck } from '../../common/decorators/skip-subscription.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { Role } from '../../../generated/prisma/client.js';
import { HttpCacheInterceptor } from '../../common/interceptors/http-cache.interceptor.js';

@Controller('billing')
@SkipSubscriptionCheck()
@Roles(Role.OWNER)
@UseInterceptors(HttpCacheInterceptor)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('current')
  @CacheTTL(600) // 10 minutes
  async getCurrentBilling(@Req() req: any) {
    const tenantId = req.tenantId || req.user?.tenantId;
    return this.billingService.getCurrent(tenantId);
  }

  @Get('plans')
  @CacheTTL(86400) // 24 hours
  async getPlans() {
    return this.billingService.getPlans();
  }

  @Get('invoices')
  @CacheTTL(900) // 15 minutes
  async getInvoices(@Req() req: any, @Query() query: ListInvoicesQueryDto) {
    const tenantId = req.tenantId || req.user?.tenantId;
    return this.billingService.getInvoices(tenantId, query);
  }

  @Post('upgrade')
  async upgradePlan(@Req() req: any, @Body() dto: UpgradePlanDto) {
    const tenantId = req.tenantId || req.user?.tenantId;
    return this.billingService.upgrade(tenantId, dto);
  }

  @Post('renew')
  async renewSubscription(@Req() req: any) {
    const tenantId = req.tenantId || req.user?.tenantId;
    return this.billingService.renew(tenantId);
  }

  @Post('cancel')
  async cancelSubscription(@Req() req: any) {
    const tenantId = req.tenantId || req.user?.tenantId;
    return this.billingService.cancel(tenantId);
  }

  @Post('verify-payment')
  async verifyPayment(@Req() req: any, @Body() dto: VerifyTenantPaymentDto) {
    const tenantId = req.tenantId || req.user?.tenantId;
    return this.billingService.verifyPayment(tenantId, dto);
  }
}
