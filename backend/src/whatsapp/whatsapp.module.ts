import { Module } from '@nestjs/common';
import { WhatsappService } from './services/whatsapp.service.js';
import { WhatsappController } from './controllers/whatsapp.controller.js';
import { MetaWhatsAppProvider } from './providers/meta-whatsapp.provider.js';
import { MockWhatsAppProvider } from './providers/mock-whatsapp.provider.js';
import { WHATSAPP_PROVIDER_TOKEN } from './providers/whatsapp-provider.interface.js';
import { WhatsappQueueProcessor } from './services/whatsapp-queue.processor.js';

@Module({
  controllers: [WhatsappController],
  providers: [
    MetaWhatsAppProvider,
    MockWhatsAppProvider,
    {
      provide: WHATSAPP_PROVIDER_TOKEN,
      useFactory: (
        metaProvider: MetaWhatsAppProvider,
        mockProvider: MockWhatsAppProvider,
      ) => {
        const provider = process.env.WHATSAPP_PROVIDER || 'mock';
        return provider === 'mock' ? mockProvider : metaProvider;
      },
      inject: [MetaWhatsAppProvider, MockWhatsAppProvider],
    },
    WhatsappService,
    WhatsappQueueProcessor,
  ],
  exports: [WhatsappService],
})
export class WhatsappModule {}
