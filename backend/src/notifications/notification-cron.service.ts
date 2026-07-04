import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from './notifications.service.js';
import { NotificationType } from './dto/notification-type.enum.js';
import { NotificationQueueService } from './notification-queue.service.js';
import type { RenewalReminderJobData } from './notification-queue.types.js';

@Injectable()
export class NotificationCronService {
  private readonly logger = new Logger(NotificationCronService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private notificationQueue: NotificationQueueService,
  ) {}

  // Run daily at midnight server time
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyNotifications() {
    this.logger.log('Starting daily notification generation...');

    try {
      // Parallelize independent notification generators
      await Promise.all([
        this.generateExpirationNotifications(),
        this.generatePaymentDueNotifications(),
      ]);
      this.logger.log('Completed daily notification generation.');
    } catch (error) {
      this.logger.error(
        'Error during daily notification generation',
        error.stack,
      );
    }
  }

  async generateExpirationNotifications() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getTargetDate = (daysToAdd: number) => {
      const date = new Date(today);
      date.setDate(date.getDate() + daysToAdd);
      return date;
    };

    const daysToCheck = [30, 15, 7, 3, 1, 0];
    const dateRanges = daysToCheck.map((days) => {
      const targetDate = getTargetDate(days);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      return { days, targetDate, nextDay };
    });

    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        OR: dateRanges.map((r) => ({
          endDate: { gte: r.targetDate, lt: r.nextDay },
        })),
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            deletedAt: true,
          },
        },
        membershipPlan: {
          select: { name: true },
        },
      },
    });

    const notificationsToCreate: any[] = [];
    const renewalReminderJobs: RenewalReminderJobData[] = [];

    for (const sub of subscriptions) {
      const subEndDate = new Date(sub.endDate);
      subEndDate.setHours(0, 0, 0, 0);
      const diffTime = subEndDate.getTime() - today.getTime();
      const days = Math.round(diffTime / (1000 * 60 * 60 * 24));
      const effectiveDays = days >= 0 ? days : 0;

      const isExpired = effectiveDays === 0;
      const type = isExpired
        ? NotificationType.MEMBERSHIP_EXPIRED
        : NotificationType.MEMBERSHIP_EXPIRING;

      const title = isExpired
        ? 'Membership Expired'
        : `Membership Expiring in ${effectiveDays} days`;

      const targetDate = getTargetDate(effectiveDays);
      const message = isExpired
        ? `Your membership plan "${sub.membershipPlan.name}" has expired today. Please renew to continue access.`
        : `Your membership plan "${sub.membershipPlan.name}" will expire on ${targetDate.toLocaleDateString()}. Please renew soon.`;

      notificationsToCreate.push({
        tenantId: sub.tenantId,
        memberId: sub.memberId,
        type,
        title,
        message,
        metadata: { subscriptionId: sub.id, daysRemaining: effectiveDays },
      });

      if ([7, 3, 1, 0].includes(effectiveDays)) {
        renewalReminderJobs.push({
          tenantId: sub.tenantId,
          subscriptionId: sub.id,
          memberId: sub.memberId,
          daysRemaining: effectiveDays,
          amount: sub.amount.toString(),
          subscriptionDeletedAt: sub.deletedAt?.toISOString() ?? null,
          member: {
            firstName: sub.member.firstName,
            lastName: sub.member.lastName,
            email: sub.member.email,
            phone: sub.member.phone,
            deletedAt: sub.member.deletedAt?.toISOString() ?? null,
          },
        });
      }
    }

    if (notificationsToCreate.length > 0) {
      await this.prisma.notification.createMany({
        data: notificationsToCreate,
      });
    }

    await this.notificationQueue.enqueueRenewalReminders(renewalReminderJobs);
  }

  async generatePaymentDueNotifications() {
    // Notify about payments that are pending for ACTIVE subscriptions
    let skip = 0;
    const limit = 500;
    let hasMore = true;

    while (hasMore) {
      const pendingPayments = await this.prisma.payment.findMany({
        where: {
          paymentStatus: 'PENDING',
        },
        select: {
          id: true,
          tenantId: true,
          memberId: true,
          amount: true,
        },
        skip,
        take: limit,
      });

      if (pendingPayments.length === 0) {
        hasMore = false;
        break;
      }

      const notificationsToCreate = pendingPayments.map((payment) => ({
        tenantId: payment.tenantId,
        memberId: payment.memberId,
        type: NotificationType.PAYMENT_DUE,
        title: 'Payment Due',
        message: `You have a pending payment of ${payment.amount} for your membership. Please clear your dues.`,
        metadata: { paymentId: payment.id, amount: payment.amount },
      }));

      if (notificationsToCreate.length > 0) {
        await this.prisma.notification.createMany({
          data: notificationsToCreate,
        });
      }

      skip += limit;
    }
  }

}
