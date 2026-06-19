import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { TenantSubscriptionModule } from '../tenant-subscription/tenant-subscription.module.js';
import { RazorpayModule } from '../razorpay/razorpay.module.js';
import { BillingController } from './controllers/billing.controller.js';
import { BillingService } from './services/billing.service.js';

@Module({
  imports: [PrismaModule, TenantSubscriptionModule, RazorpayModule],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
