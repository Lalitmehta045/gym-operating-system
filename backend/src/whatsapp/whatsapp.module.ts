import { Module } from '@nestjs/common';
import { WhatsappService } from './services/whatsapp.service.js';
import { WhatsappController } from './controllers/whatsapp.controller.js';
import { MetaWhatsAppProvider } from './providers/meta-whatsapp.provider.js';
import { MockWhatsAppProvider } from './providers/mock-whatsapp.provider.js';
import { Msg91WhatsAppProvider } from './providers/msg91-whatsapp.provider.js';
import { TwilioWhatsAppProvider } from './providers/twilio-whatsapp.provider.js';
import { InteraktWhatsAppProvider } from './providers/interakt-whatsapp.provider.js';
import { AiSensyWhatsAppProvider } from './providers/aisensy-whatsapp.provider.js';
import { WHATSAPP_PROVIDER_TOKEN, WHATSAPP_PROVIDERS_TOKEN } from './providers/whatsapp-provider.interface.js';
import { WhatsappQueueProcessor } from './services/whatsapp-queue.processor.js';
import { WhatsappProviderRegistry } from './services/whatsapp-provider.registry.js';

@Module({
  controllers: [WhatsappController],
  providers: [
    MetaWhatsAppProvider,
    MockWhatsAppProvider,
    Msg91WhatsAppProvider,
    TwilioWhatsAppProvider,
    InteraktWhatsAppProvider,
    AiSensyWhatsAppProvider,
    {
      provide: WHATSAPP_PROVIDERS_TOKEN,
      useFactory: (
        metaProvider: MetaWhatsAppProvider,
        mockProvider: MockWhatsAppProvider,
        msg91Provider: Msg91WhatsAppProvider,
        twilioProvider: TwilioWhatsAppProvider,
        interaktProvider: InteraktWhatsAppProvider,
        aisensyProvider: AiSensyWhatsAppProvider,
      ) => [
        metaProvider,
        mockProvider,
        msg91Provider,
        twilioProvider,
        interaktProvider,
        aisensyProvider
      ],
      inject: [
        MetaWhatsAppProvider,
        MockWhatsAppProvider,
        Msg91WhatsAppProvider,
        TwilioWhatsAppProvider,
        InteraktWhatsAppProvider,
        AiSensyWhatsAppProvider
      ]
    },
    {
      provide: WHATSAPP_PROVIDER_TOKEN,
      useFactory: (
        metaProvider: MetaWhatsAppProvider,
        mockProvider: MockWhatsAppProvider,
        msg91Provider: Msg91WhatsAppProvider,
        twilioProvider: TwilioWhatsAppProvider,
        interaktProvider: InteraktWhatsAppProvider,
        aisensyProvider: AiSensyWhatsAppProvider,
      ) => {
        // This will be replaced in the service to dynamically select based on tenant settings
        return metaProvider; // Default to meta for backward compatibility
      },
      inject: [
        MetaWhatsAppProvider,
        MockWhatsAppProvider,
        Msg91WhatsAppProvider,
        TwilioWhatsAppProvider,
        InteraktWhatsAppProvider,
        AiSensyWhatsAppProvider
      ],
    },
    WhatsappService,
    WhatsappQueueProcessor,
    WhatsappProviderRegistry,
  ],
  exports: [WhatsappService, WhatsappProviderRegistry],
})
export class WhatsappModule {}

