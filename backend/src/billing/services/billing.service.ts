import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TenantSubscriptionService } from '../../tenant-subscription/services/tenant-subscription.service.js';
import { RazorpayService } from '../../razorpay/services/razorpay.service.js';
import { ListInvoicesQueryDto, UpgradePlanDto } from '../dto/billing.dto.js';
import { VerifyTenantPaymentDto } from '../../razorpay/dto/verify-tenant-payment.dto.js';

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantSubscriptionService: TenantSubscriptionService,
    private readonly razorpayService: RazorpayService,
  ) {}

  async getCurrent(tenantId: string) {
    const subscription = await this.tenantSubscriptionService.getCurrentSubscription(tenantId);
    if (!subscription) {
      return { subscription: null, plan: null, daysRemaining: 0, isTrial: false };
    }

    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const diffMs = endDate.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    return {
      subscription,
      plan: subscription.platformPlan,
      daysRemaining,
      isTrial: subscription.status === 'TRIAL',
    };
  }

  async getPlans() {
    return this.prisma.platformPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  async getInvoices(tenantId: string, query: ListInvoicesQueryDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [invoices, total] = await this.prisma.$transaction([
      this.prisma.tenantInvoice.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { issuedAt: 'desc' },
      }),
      this.prisma.tenantInvoice.count({ where: { tenantId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: invoices,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async upgrade(tenantId: string, dto: UpgradePlanDto) {
    const plan = await this.prisma.platformPlan.findUnique({
      where: { id: dto.planId },
    });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return this.razorpayService.createTenantOrder(tenantId, dto);
  }

  async renew(tenantId: string) {
    const currentSub = await this.tenantSubscriptionService.getCurrentSubscription(tenantId);
    if (!currentSub) {
      throw new NotFoundException('No active subscription found to renew');
    }

    return this.razorpayService.createTenantOrder(tenantId, {
      planId: currentSub.platformPlanId,
    });
  }

  async cancel(tenantId: string) {
    return this.tenantSubscriptionService.cancelSubscription(tenantId);
  }

  async verifyPayment(tenantId: string, dto: VerifyTenantPaymentDto) {
    return this.razorpayService.verifyTenantPayment(tenantId, dto);
  }
}
