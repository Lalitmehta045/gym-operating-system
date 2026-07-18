import { Module } from '@nestjs/common';
import { RazorpayController } from './controllers/razorpay.controller.js';
import { MockWebhookController } from './controllers/mock-webhook.controller.js';
import { RazorpayService } from './services/razorpay.service.js';
import { PaymentsModule } from '../payments/payments.module.js';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module.js';
import { InvoicesModule } from '../invoices/invoices.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { TenantSubscriptionModule } from '../tenant-subscription/tenant-subscription.module.js';
import { WhatsappModule } from '../whatsapp/whatsapp.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { RealRazorpayProvider } from './providers/real-razorpay.provider.js';
import { MockRazorpayProvider } from './providers/mock-razorpay.provider.js';
import { PAYMENT_PROVIDER_TOKEN } from './providers/payment-provider.interface.js';

@Module({
  imports: [
    PrismaModule,
    PaymentsModule,
    SubscriptionsModule,
    InvoicesModule,
    TenantSubscriptionModule,
    WhatsappModule,
    AuditModule,
  ],
  controllers: [RazorpayController, MockWebhookController],
  providers: [
    RazorpayService,
    RealRazorpayProvider,
    MockRazorpayProvider,
    {
      provide: PAYMENT_PROVIDER_TOKEN,
      useFactory: (realProvider: RealRazorpayProvider, mockProvider: MockRazorpayProvider) => {
        const provider = process.env.PAYMENT_PROVIDER || 'mock';
        if (provider === 'mock') {
          return mockProvider;
        }
        return realProvider;
      },
      inject: [RealRazorpayProvider, MockRazorpayProvider],
    }
  ],
  exports: [RazorpayService],
})
export class RazorpayModule {}

