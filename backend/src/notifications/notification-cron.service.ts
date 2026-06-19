import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from './notifications.service.js';
import { Prisma } from '@prisma/client';
import { NotificationType } from './dto/notification-type.enum.js';

import { WhatsappService } from '../whatsapp/services/whatsapp.service.js';
import { RazorpayService } from '../razorpay/services/razorpay.service.js';

@Injectable()
export class NotificationCronService {
  private readonly logger = new Logger(NotificationCronService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private whatsappService: WhatsappService,
    private razorpayService: RazorpayService,
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

    for (const days of daysToCheck) {
      const targetDate = getTargetDate(days);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const isExpired = days === 0;
      const type = isExpired
        ? NotificationType.MEMBERSHIP_EXPIRED
        : NotificationType.MEMBERSHIP_EXPIRING;

      // Find active subscriptions ending on this date
      const subscriptions = await this.prisma.subscription.findMany({
        where: {
          endDate: {
            gte: targetDate,
            lt: nextDay,
          },
          status: 'ACTIVE',
        },
        include: {
          membershipPlan: true,
        },
      });

      const notificationsToCreate: any[] = subscriptions.map((sub) => {
        const title = isExpired
          ? 'Membership Expired'
          : `Membership Expiring in ${days} days`;
        const message = isExpired
          ? `Your membership plan "${sub.membershipPlan.name}" has expired today. Please renew to continue access.`
          : `Your membership plan "${sub.membershipPlan.name}" will expire on ${targetDate.toLocaleDateString()}. Please renew soon.`;

        return {
          tenantId: sub.tenantId,
          memberId: sub.memberId,
          type,
          title,
          message,
          metadata: { subscriptionId: sub.id, daysRemaining: days },
        };
      });

      // Create notifications in bulk
      if (notificationsToCreate.length > 0) {
        await this.prisma.notification.createMany({
          data: notificationsToCreate,
        });
      }

      // Parallelize WhatsApp notifications and payment link creation
      await Promise.all(
        subscriptions.map(async (sub) => {
          // WhatsApp Reminder Logic
          if ([7, 3, 1, 0].includes(days)) {
            const paymentLink =
              days > 0
                ? await this.razorpayService.createPaymentLink(
                    sub.tenantId,
                    sub.id,
                    sub.memberId,
                  )
                : undefined;

            await this.whatsappService.sendRenewalReminder(
              sub.tenantId,
              sub.memberId,
              days,
              paymentLink ?? undefined,
            );
          }
        }),
      );
    }
  }

  async generatePaymentDueNotifications() {
    // Notify about payments that are pending for ACTIVE subscriptions
    const pendingPayments = await this.prisma.payment.findMany({
      where: {
        paymentStatus: 'PENDING',
      },
    });

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
  }
}
