import { Module } from '@nestjs/common';
import { WhatsappService } from './services/whatsapp.service.js';
import { WhatsappController } from './controllers/whatsapp.controller.js';

@Module({
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
