import { Module } from '@nestjs/common';
import { RazorpayController } from './controllers/razorpay.controller.js';
import { RazorpayService } from './services/razorpay.service.js';
import { PaymentsModule } from '../payments/payments.module.js';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module.js';
import { InvoicesModule } from '../invoices/invoices.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { TenantSubscriptionModule } from '../tenant-subscription/tenant-subscription.module.js';
import { WhatsappModule } from '../whatsapp/whatsapp.module.js';

@Module({
  imports: [
    PrismaModule,
    PaymentsModule,
    SubscriptionsModule,
    InvoicesModule,
    TenantSubscriptionModule,
    WhatsappModule,
  ],
  controllers: [RazorpayController],
  providers: [RazorpayService],
  exports: [RazorpayService],
})
export class RazorpayModule {}
