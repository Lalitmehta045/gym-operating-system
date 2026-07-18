import { Injectable, Logger, InternalServerErrorException, ServiceUnavailableException, GatewayTimeoutException, BadGatewayException } from '@nestjs/common';
import { IWhatsAppProvider } from './whatsapp-provider.interface.js';
import axios from 'axios';
import { ExternalServiceCall } from '../../common/utils/circuit-breaker.util.js';

@Injectable()
export class MetaWhatsAppProvider implements IWhatsAppProvider {
  private readonly logger = new Logger(MetaWhatsAppProvider.name);
  private readonly apiUrl = 'https://graph.facebook.com/v19.0';

  private get isConfigured(): boolean {
    return !!(
      process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
    );
  }

  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    components: any[]
  ): Promise<{ messageId: string }> {
    if (!this.isConfigured) {
      this.logger.warn('WhatsApp is not configured. Template not sent.');
      throw new InternalServerErrorException('WhatsApp is not configured');
    }

    try {
      const response = await ExternalServiceCall.execute(
        'whatsapp-send-template',
        () => axios.post(
          `${this.apiUrl}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
          {
            messaging_product: 'whatsapp',
            to,
            type: 'template',
            template: {
              name: templateName,
              language: { code: languageCode },
              components,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
            timeout: 5000,
          }
        ),
        (err) => {
          this.logger.error('WhatsApp API unavailable for template.', err);
          throw err; // Let it throw to trigger retry handling by the caller
        },
        { timeout: 5000 }
      );

      const messageId = response.data.messages?.[0]?.id;
      if (!messageId) {
        throw new InternalServerErrorException('No message ID returned from Meta API');
      }

      return { messageId };
    } catch (error: any) {
      const status = error.response?.status;
      
      // Determine if error is transient for the Queue to handle retries
      if (status === 429) {
        throw new ServiceUnavailableException('WhatsApp API Rate Limited (429)');
      } else if (status === 500) {
        throw new InternalServerErrorException('WhatsApp API Internal Error (500)');
      } else if (status === 502) {
        throw new BadGatewayException('WhatsApp API Bad Gateway (502)');
      } else if (status === 503) {
        throw new ServiceUnavailableException('WhatsApp API Service Unavailable (503)');
      } else if (status === 504) {
        throw new GatewayTimeoutException('WhatsApp API Gateway Timeout (504)');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new GatewayTimeoutException('WhatsApp API Request Timeout');
      }

      // If it's a 400 Bad Request, it's non-transient, throw the raw error
      throw error;
    }
  }
}
