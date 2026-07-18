import { Module } from '@nestjs/common';
import { DashboardController } from './controllers/dashboard.controller.js';
import { DashboardService } from './services/dashboard.service.js';
import { FinancialsModule } from '../financials/financials.module.js';

@Module({
  imports: [FinancialsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
