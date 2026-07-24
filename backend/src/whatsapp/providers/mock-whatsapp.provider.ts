import { Injectable, Logger } from '@nestjs/common';
import { IWhatsAppProvider } from './whatsapp-provider.interface.js';
import crypto from 'crypto';

@Injectable()
export class MockWhatsAppProvider implements IWhatsAppProvider {
  providerName = 'MOCK';
  private readonly logger = new Logger(MockWhatsAppProvider.name);

  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    components: any[],
    credentials: Record<string, any> = {}
  ): Promise<{ messageId: string }> {
    this.logger.log(`[MOCK] Sending WhatsApp template '${templateName}' to ${to}`);
    this.logger.log(`[MOCK] Language: ${languageCode}, Components: ${JSON.stringify(components)}`);

    // Simulate transient failure randomly (10% chance) for testing retries if needed, 
    // but typically mock providers just succeed unless specifically configured to fail.
    // For this mock, we'll always succeed.
    
    return {
      messageId: `mock_wa_msg_${crypto.randomBytes(8).toString('hex')}`
    };
  }
}
