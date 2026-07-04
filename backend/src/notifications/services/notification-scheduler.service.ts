import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ExpiryNotificationService } from './expiry-notification.service.js';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private readonly expiryNotificationService: ExpiryNotificationService,
  ) {}

  // Run every day at 9:00 AM IST (3:30 AM UTC)
  @Cron('30 3 * * *', {
    name: 'expiry-notifications',
    timeZone: 'Asia/Kolkata',
  })
  async handleExpiryNotifications() {
    this.logger.log('Cron: Starting expiry notification job');
    await this.expiryNotificationService.processExpiringSubscriptions();
    this.logger.log('Cron: Finished expiry notification job');
  }
}
