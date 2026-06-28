import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  TenantSubscriptionStatus,
  TenantStatus,
  PaymentStatus,
} from '../../../generated/prisma/client.js';

const TRIAL_DAYS = 14;
const SUBSCRIPTION_DAYS = 30;

@Injectable()
export class TenantSubscriptionService {
  private readonly logger = new Logger(TenantSubscriptionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createTrialSubscription(tenantId: string) {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + TRIAL_DAYS);

    const starterPlan = await this.prisma.platformPlan.findFirst({
      where: { name: 'Starter', isActive: true },
    });

    if (!starterPlan) {
      this.logger.warn(
        'Starter plan not found, trial subscription created without plan reference',
      );
    }

    const subscription = await this.prisma.tenantSubscription.create({
      data: {
        tenantId,
        platformPlanId:
          starterPlan?.id ?? '00000000-0000-0000-0000-000000000000',
        status: TenantSubscriptionStatus.TRIAL,
        startDate: now,
        endDate,
        trialEndsAt: endDate,
      },
    });

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { status: TenantStatus.TRIAL },
    });

    this.logger.log(
      `Trial subscription created for tenant ${tenantId} until ${endDate.toISOString()}`,
    );
    return subscription;
  }

  async activateSubscription(
    tenantId: string,
    planId: string,
    invoiceId: string,
  ) {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + SUBSCRIPTION_DAYS);

    const currentSub = await this.getCurrentSubscription(tenantId);

    const subscription = await this.prisma.tenantSubscription.create({
      data: {
        tenantId,
        platformPlanId: planId,
        status: TenantSubscriptionStatus.ACTIVE,
        startDate: now,
        endDate,
      },
    });

    await this.prisma.tenantInvoice.update({
      where: { id: invoiceId },
      data: { tenantSubscriptionId: subscription.id },
    });

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { status: TenantStatus.ACTIVE },
    });

    this.logger.log(
      `Subscription activated for tenant ${tenantId} on plan ${planId} until ${endDate.toISOString()}`,
    );
    return subscription;
  }

  async renewSubscription(tenantId: string) {
    const currentSub = await this.getCurrentSubscription(tenantId);
    if (!currentSub) {
      throw new NotFoundException('No active subscription found to renew');
    }

    const newEndDate = new Date(currentSub.endDate);
    newEndDate.setDate(newEndDate.getDate() + SUBSCRIPTION_DAYS);

    const subscription = await this.prisma.tenantSubscription.update({
      where: { id: currentSub.id },
      data: {
        endDate: newEndDate,
        status: TenantSubscriptionStatus.ACTIVE,
      },
    });

    this.logger.log(
      `Subscription renewed for tenant ${tenantId} until ${newEndDate.toISOString()}`,
    );
    return subscription;
  }

  async cancelSubscription(tenantId: string) {
    const currentSub = await this.getCurrentSubscription(tenantId);
    if (!currentSub) {
      throw new NotFoundException('No active subscription found to cancel');
    }

    const subscription = await this.prisma.tenantSubscription.update({
      where: { id: currentSub.id },
      data: {
        status: TenantSubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
        autoRenew: false,
      },
    });

    this.logger.log(`Subscription cancelled for tenant ${tenantId}`);
    return subscription;
  }

  async expireSubscription(tenantId: string) {
    const currentSub = await this.getCurrentSubscription(tenantId);
    if (!currentSub) {
      this.logger.warn(
        `No subscription found to expire for tenant ${tenantId}`,
      );
      return null;
    }

    const [subscription] = await Promise.all([
      this.prisma.tenantSubscription.update({
        where: { id: currentSub.id },
        data: {
          status: TenantSubscriptionStatus.EXPIRED,
        },
      }),
      this.prisma.tenant.update({
        where: { id: tenantId },
        data: { status: TenantStatus.EXPIRED },
      }),
    ]);

    this.logger.log(`Subscription expired for tenant ${tenantId}`);
    return subscription;
  }

  async getCurrentSubscription(tenantId: string) {
    return this.prisma.tenantSubscription.findFirst({
      where: {
        tenantId,
        status: { not: TenantSubscriptionStatus.CANCELLED },
      },
      orderBy: { createdAt: 'desc' },
      include: { platformPlan: true },
    });
  }

  async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.tenantInvoice.count({
      where: {
        invoiceNumber: { startsWith: `INV-SAAS-${year}-` },
      },
    });
    const seq = String(count + 1).padStart(4, '0');
    return `INV-SAAS-${year}-${seq}`;
  }
}
