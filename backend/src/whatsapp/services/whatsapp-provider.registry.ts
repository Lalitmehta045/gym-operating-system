import { Injectable, Inject, Logger } from '@nestjs/common';
import { IWhatsAppProvider, WHATSAPP_PROVIDERS_TOKEN } from '../providers/whatsapp-provider.interface.js';

@Injectable()
export class WhatsappProviderRegistry {
  private readonly providers = new Map<string, IWhatsAppProvider>();
  private readonly logger = new Logger(WhatsappProviderRegistry.name);

  constructor(
    @Inject(WHATSAPP_PROVIDERS_TOKEN) providerList: IWhatsAppProvider[]
  ) {
    providerList.forEach(provider => {
      // In case they have MSG91 or other cases, normalize
      this.providers.set(provider.providerName.toUpperCase(), provider);
    });
    this.logger.log(`Registered ${providerList.length} WhatsApp providers: ${Array.from(this.providers.keys()).join(', ')}`);
  }

  /**
   * Retrieves a WhatsApp provider by its name (e.g. 'META', 'MSG91')
   */
  getProvider(name: string): IWhatsAppProvider {
    const normalizedName = name.toUpperCase();
    const provider = this.providers.get(normalizedName);
    
    if (!provider) {
      this.logger.error(`WhatsApp provider ${normalizedName} not found in registry`);
      throw new Error(`WhatsApp provider ${normalizedName} not found`);
    }
    
    return provider;
  }
}
