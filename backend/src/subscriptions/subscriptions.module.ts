import { Module } from '@nestjs/common';
import { SubscriptionsController } from './controllers/subscriptions.controller.js';
import { SubscriptionsService } from './services/subscriptions.service.js';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
