import { Module } from '@nestjs/common';
import { FinancialsController } from './controllers/financials.controller.js';
import { FinancialsService } from './services/financials.service.js';
import { FinancialMetricsService } from './services/financial-metrics.service.js';

@Module({
  controllers: [FinancialsController],
  providers: [FinancialsService, FinancialMetricsService],
  exports: [FinancialsService, FinancialMetricsService],
})
export class FinancialsModule {}
