import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TenantSubscriptionService } from './tenant-subscription.service.js';
import { WhatsappService } from '../../whatsapp/services/whatsapp.service.js';
import { TenantSubscriptionStatus } from '../../../generated/prisma/client.js';

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
        status: { in: [TenantSubscriptionStatus.ACTIVE, TenantSubscriptionStatus.TRIAL] },
        endDate: { lt: today },
      },
      select: { tenantId: true },
    });

    for (const sub of expiredSubs) {
      try {
        await this.tenantSubscriptionService.expireSubscription(sub.tenantId);
      } catch (err) {
        this.logger.error(`Failed to expire subscription for tenant ${sub.tenantId}`, err);
      }
    }

    this.logger.log(`Checked ${expiredSubs.length} expired subscriptions`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendRenewalReminders() {
    const reminderDays = [7, 3, 1, 0];

    for (const days of reminderDays) {
      const targetDate = new Date();
      targetDate.setHours(0, 0, 0, 0);
      targetDate.setDate(targetDate.getDate() + days);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const subs = await this.prisma.tenantSubscription.findMany({
        where: {
          status: { in: [TenantSubscriptionStatus.ACTIVE, TenantSubscriptionStatus.TRIAL] },
          endDate: {
            gte: targetDate,
            lt: nextDay,
          },
        },
        include: { tenant: true },
      });

      for (const sub of subs) {
        try {
          await this.whatsappService.sendTenantRenewalReminder(
            sub.tenantId,
            days,
          );
        } catch (err) {
          this.logger.error(`Failed to send renewal reminder to tenant ${sub.tenantId}`, err);
        }
      }
    }

    this.logger.log('Sent renewal reminders for expiring subscriptions');
  }
}
