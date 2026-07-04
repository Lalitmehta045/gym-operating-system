import { Injectable, Logger } from '@nestjs/common';
import type { RenewalReminderJobData } from './notification-queue.types.js';
import { NotificationProcessor } from './processors/notification.processor.js';

@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);

  constructor(private readonly notificationProcessor: NotificationProcessor) {}

  async enqueueRenewalReminders(
    reminders: RenewalReminderJobData[],
  ): Promise<void> {
    if (reminders.length === 0) return;

    this.logger.log(`Processing ${reminders.length} renewal reminder jobs in background`);

    // Process all reminders concurrently in the background
    Promise.allSettled(
      reminders.map((reminder) =>
        this.notificationProcessor.processRenewalReminder(reminder),
      ),
    ).then((results) => {
      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        this.logger.error(`Failed to process ${failed.length} renewal reminders`);
      }
    });
  }
}
