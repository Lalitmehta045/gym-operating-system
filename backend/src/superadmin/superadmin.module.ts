import { Module } from '@nestjs/common';
import { SuperadminController } from './controllers/superadmin.controller.js';
import { SuperadminService } from './services/superadmin.service.js';
import { TenantSubscriptionModule } from '../tenant-subscription/tenant-subscription.module.js';

@Module({
  imports: [TenantSubscriptionModule],
  controllers: [SuperadminController],
  providers: [SuperadminService],
})
export class SuperadminModule {}
