import { Injectable, Logger } from '@nestjs/common';
import { RazorpayService } from '../../razorpay/services/razorpay.service.js';
import { WhatsappService } from '../../whatsapp/services/whatsapp.service.js';
import type { RenewalReminderJobData } from '../notification-queue.types.js';

@Injectable()
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly razorpayService: RazorpayService,
    private readonly whatsappService: WhatsappService,
  ) {}

  async processRenewalReminder(reminder: RenewalReminderJobData): Promise<void> {
    try {
      const paymentLink =
        reminder.daysRemaining > 0
          ? await this.razorpayService.createPaymentLinkFromSubscription({
              tenantId: reminder.tenantId,
              subscriptionId: reminder.subscriptionId,
              amount: reminder.amount,
              subscriptionDeletedAt: reminder.subscriptionDeletedAt,
              member: reminder.member,
            })
          : undefined;

      await this.whatsappService.sendRenewalReminderToMember({
        tenantId: reminder.tenantId,
        memberId: reminder.memberId,
        daysRemaining: reminder.daysRemaining,
        paymentLink: paymentLink ?? undefined,
        member: reminder.member,
      });
    } catch (error) {
      this.logger.error(
        `Failed to process renewal reminder for subscription ${reminder.subscriptionId}`,
        error.stack,
      );
    }
  }
}
