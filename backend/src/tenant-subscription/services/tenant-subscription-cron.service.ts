import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TenantSubscriptionService } from './tenant-subscription.service.js';
import { WhatsappService } from '../../whatsapp/services/whatsapp.service.js';
import {
  TenantSubscriptionStatus,
  TenantStatus,
} from '../../../generated/prisma/client.js';

@Injectable()
export class TenantSubscriptionCronService {
  private readonly logger = new Logger(TenantSubscriptionCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantSubscriptionService: TenantSubscriptionService,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredSubscriptions() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredSubs = await this.prisma.tenantSubscription.findMany({
      where: {
        status: {
          in: [TenantSubscriptionStatus.ACTIVE, TenantSubscriptionStatus.TRIAL],
        },
        endDate: { lt: today },
      },
      select: { id: true, tenantId: true },
    });

    if (expiredSubs.length > 0) {
      const subIds = expiredSubs.map((s) => s.id);
      const tenantIds = expiredSubs.map((s) => s.tenantId);

      try {
        await this.prisma.$transaction([
          this.prisma.tenantSubscription.updateMany({
            where: { id: { in: subIds } },
            data: { status: TenantSubscriptionStatus.EXPIRED },
          }),
          this.prisma.tenant.updateMany({
            where: { id: { in: tenantIds } },
            data: { status: TenantStatus.EXPIRED },
          }),
        ]);
      } catch (err) {
        this.logger.error(`Failed to expire subscriptions`, err);
      }
    }

    this.logger.log(`Checked ${expiredSubs.length} expired subscriptions`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendRenewalReminders() {
    const reminderDays = [7, 3, 1, 0];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Fetch all subscriptions needing renewal reminders
    const subs = await this.prisma.tenantSubscription.findMany({
      where: {
        status: {
          in: [TenantSubscriptionStatus.ACTIVE, TenantSubscriptionStatus.TRIAL],
        },
        OR: reminderDays.map((days) => {
          const targetDate = new Date(today);
          targetDate.setDate(targetDate.getDate() + days);

          const nextDay = new Date(targetDate);
          nextDay.setDate(nextDay.getDate() + 1);

          return {
            endDate: {
              gte: targetDate,
              lt: nextDay,
            },
          };
        }),
      },
      select: {
        tenant: true,
        id: true,
        tenantId: true,
        platformPlanId: true,
        status: true,
        startDate: true,
        endDate: true,
        autoRenew: true,
        trialEndsAt: true,
        cancelledAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (subs.length === 0) {
      this.logger.log('No tenant subscriptions need renewal reminders today.');
      return;
    }

    // 2. Batch fetch existing WhatsApp logs for all relevant subscriptions
    const logTypes = reminderDays.map((d) => `TENANT_EXPIRING_${d}_DAYS`);
    const existingLogs = await this.prisma.whatsAppLog.findMany({
      where: {
        tenantId: { in: subs.map((s) => s.tenantId) },
        type: { in: logTypes },
        createdAt: { gte: today },
      },
      select: { tenantId: true, type: true },
    });

    // 3. Use in-memory filtering to check if reminder was already sent
    const logSet = new Set(existingLogs.map((l) => `${l.tenantId}:${l.type}`));

    const jobs: { tenantId: string; diffDays: number }[] = [];
    for (const sub of subs) {
      const subEndDate = new Date(sub.endDate);
      subEndDate.setHours(0, 0, 0, 0);

      const diffTime = subEndDate.getTime() - today.getTime();
      const diffDays = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
      const type = `TENANT_EXPIRING_${diffDays}_DAYS`;

      if (!logSet.has(`${sub.tenantId}:${type}`)) {
        jobs.push({ tenantId: sub.tenantId, diffDays });
      }
    }

    // 4. Execute jobs directly
    if (jobs.length > 0) {
      this.logger.log(`Processing ${jobs.length} tenant renewal reminders.`);
      Promise.allSettled(
        jobs.map(job => 
          this.whatsappService.sendTenantRenewalReminder(job.tenantId, job.diffDays)
        )
      ).then(results => {
        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length > 0) {
          this.logger.error(`Failed to send ${failed.length} renewal reminders`);
        }
      });
    } else {
      this.logger.log('All required tenant renewal reminders have already been sent today.');
    }
  }
}
