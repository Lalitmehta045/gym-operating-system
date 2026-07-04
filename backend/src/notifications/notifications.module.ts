import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { NotificationsController } from './notifications.controller.js';
import { NotificationCronService } from './notification-cron.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

import { WhatsappModule } from '../whatsapp/whatsapp.module.js';
import { RazorpayModule } from '../razorpay/razorpay.module.js';
import { SettingsModule } from '../settings/settings.module.js';
import { ExpiryNotificationService } from './services/expiry-notification.service.js';
import { NotificationSchedulerService } from './services/notification-scheduler.service.js';
import { NotificationQueueService } from './notification-queue.service.js';
import { NotificationProcessor } from './processors/notification.processor.js';

@Module({
  imports: [PrismaModule, WhatsappModule, RazorpayModule, SettingsModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationCronService,
    ExpiryNotificationService,
    NotificationSchedulerService,
    NotificationQueueService,
    NotificationProcessor,
  ],
  exports: [NotificationsService, ExpiryNotificationService],
})
export class NotificationsModule {}
