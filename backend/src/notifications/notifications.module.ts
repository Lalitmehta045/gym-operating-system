import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { NotificationsController } from './notifications.controller.js';
import { NotificationCronService } from './notification-cron.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

import { WhatsappModule } from '../whatsapp/whatsapp.module.js';
import { RazorpayModule } from '../razorpay/razorpay.module.js';

@Module({
  imports: [PrismaModule, WhatsappModule, RazorpayModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationCronService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
