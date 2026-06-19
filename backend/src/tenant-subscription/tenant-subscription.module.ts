import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { TenantSubscriptionService } from './services/tenant-subscription.service.js';
import { TenantSubscriptionCronService } from './services/tenant-subscription-cron.service.js';
import { WhatsappModule } from '../whatsapp/whatsapp.module.js';

@Module({
  imports: [PrismaModule, WhatsappModule],
  providers: [TenantSubscriptionService, TenantSubscriptionCronService],
  exports: [TenantSubscriptionService, TenantSubscriptionCronService],
})
export class TenantSubscriptionModule {}
