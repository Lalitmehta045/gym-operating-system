import { Module } from '@nestjs/common';
import { ReportsController } from './controllers/reports.controller.js';
import { ReportsService } from './services/reports.service.js';
import { FinancialsModule } from '../financials/financials.module.js';

@Module({
  imports: [FinancialsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
