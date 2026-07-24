import { Injectable, Logger, InternalServerErrorException, ServiceUnavailableException, GatewayTimeoutException, BadGatewayException } from '@nestjs/common';
import { IWhatsAppProvider } from './whatsapp-provider.interface.js';
import axios from 'axios';
import { ExternalServiceCall } from '../../common/utils/circuit-breaker.util.js';

@Injectable()
export class AiSensyWhatsAppProvider implements IWhatsAppProvider {
  providerName = 'aisensy';
  private readonly logger = new Logger(AiSensyWhatsAppProvider.name);
  private readonly apiUrl = 'https://api.aisensy.com/v1/whatsapp/send';

  
  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    components: any[],
    credentials: Record<string, any> = {}
  ): Promise<{ messageId: string }> {
    
    try {
      const response = await ExternalServiceCall.execute(
        'whatsapp-aisensy-send-template',
        () => axios.post(
          this.apiUrl,
          {
            to: to,
            template: templateName,
            language: languageCode,
            parameters: components.flatMap(c => c.parameters || []).map(p => p.text || ''),
          },
          {
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 5000,
          }
        ),
        (err) => {
          this.logger.error('AiSensy WhatsApp API unavailable for template.', err);
          throw err;
        },
        { timeout: 5000 }
      );

      const messageId = response.data.message_id;
      if (!messageId) {
        throw new InternalServerErrorException('No message ID returned from AiSensy API');
      }

      return { messageId };
    } catch (error: any) {
      const status = error.response?.status;
      
      // Determine if error is transient for the Queue to handle retries
      if (status === 429) {
        throw new ServiceUnavailableException('AiSensy WhatsApp API Rate Limited (429)');
      } else if (status === 500) {
        throw new InternalServerErrorException('AiSensy WhatsApp API Internal Error (500)');
      } else if (status === 502) {
        throw new BadGatewayException('AiSensy WhatsApp API Bad Gateway (502)');
      } else if (status === 503) {
        throw new ServiceUnavailableException('AiSensy WhatsApp API Service Unavailable (503)');
      } else if (status === 504) {
        throw new GatewayTimeoutException('AiSensy WhatsApp API Gateway Timeout (504)');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new GatewayTimeoutException('AiSensy WhatsApp API Request Timeout');
      }

      // If it's a 400 Bad Request, it's non-transient, throw the raw error
      throw error;
    }
  }
}
