import { Injectable, Logger, InternalServerErrorException, ServiceUnavailableException, GatewayTimeoutException, BadGatewayException } from '@nestjs/common';
import { IWhatsAppProvider } from './whatsapp-provider.interface.js';
import axios from 'axios';
import { ExternalServiceCall } from '../../common/utils/circuit-breaker.util.js';

@Injectable()
export class TwilioWhatsAppProvider implements IWhatsAppProvider {
  providerName = 'twilio';
  private readonly logger = new Logger(TwilioWhatsAppProvider.name);
  private readonly apiUrl = 'https://api.twilio.com/2010-04-01/Accounts';

  
  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    components: any[],
    credentials: Record<string, any> = {}
  ): Promise<{ messageId: string }> {
    
    try {
      const response = await ExternalServiceCall.execute(
        'whatsapp-twilio-send-template',
        () => axios.post(
          `${this.apiUrl}/${credentials.accountSid}/Messages.json`,
          new URLSearchParams({
            From: `whatsapp:${credentials.whatsappNumber}`,
            To: `whatsapp:${to}`,
            Body: components.map(c => c.parameters?.[0]?.text || '').join(' '),
          }),
          {
            auth: {
              username: credentials.accountSid,
              password: credentials.authToken,
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            timeout: 5000,
          }
        ),
        (err) => {
          this.logger.error('Twilio WhatsApp API unavailable for template.', err);
          throw err;
        },
        { timeout: 5000 }
      );

      const messageId = response.data.sid;
      if (!messageId) {
        throw new InternalServerErrorException('No message ID returned from Twilio API');
      }

      return { messageId };
    } catch (error: any) {
      const status = error.response?.status;
      
      // Determine if error is transient for the Queue to handle retries
      if (status === 429) {
        throw new ServiceUnavailableException('Twilio WhatsApp API Rate Limited (429)');
      } else if (status === 500) {
        throw new InternalServerErrorException('Twilio WhatsApp API Internal Error (500)');
      } else if (status === 502) {
        throw new BadGatewayException('Twilio WhatsApp API Bad Gateway (502)');
      } else if (status === 503) {
        throw new ServiceUnavailableException('Twilio WhatsApp API Service Unavailable (503)');
      } else if (status === 504) {
        throw new GatewayTimeoutException('Twilio WhatsApp API Gateway Timeout (504)');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new GatewayTimeoutException('Twilio WhatsApp API Request Timeout');
      }

      // If it's a 400 Bad Request, it's non-transient, throw the raw error
      throw error;
    }
  }
}
