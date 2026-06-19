import { Module } from '@nestjs/common';
import { InvoicesController } from './controllers/invoices.controller.js';
import { InvoicesService } from './services/invoices.service.js';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
