import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers/payments.controller.js';
import { PaymentsService } from './services/payments.service.js';

import { PrismaModule } from '../prisma/prisma.module.js';
import { WhatsappModule } from '../whatsapp/whatsapp.module.js';

@Module({
  imports: [PrismaModule, WhatsappModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
