import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers/payments.controller.js';
import { PaymentsService } from './services/payments.service.js';
import { RazorpayWebhookController } from './controllers/razorpay-webhook.controller.js';
import { RazorpayWebhookService } from './services/razorpay-webhook.service.js';

import { PrismaModule } from '../prisma/prisma.module.js';
import { WhatsappModule } from '../whatsapp/whatsapp.module.js';
import { SettingsModule } from '../settings/settings.module.js';

@Module({
  imports: [PrismaModule, WhatsappModule, SettingsModule],
  controllers: [PaymentsController, RazorpayWebhookController],
  providers: [PaymentsService, RazorpayWebhookService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
