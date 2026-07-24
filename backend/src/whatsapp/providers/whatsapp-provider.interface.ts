export const WHATSAPP_PROVIDER_TOKEN = 'WHATSAPP_PROVIDER_TOKEN';
export const WHATSAPP_PROVIDERS_TOKEN = 'WHATSAPP_PROVIDERS_TOKEN';

export interface IWhatsAppProvider {
  /**
   * Name of the provider (used for selection)
   */
  providerName: string;

  /**
   * Sends a WhatsApp template message.
   * @param to The recipient's phone number
   * @param templateName The name of the template
   * @param languageCode The language code (e.g., 'en_US')
   * @param components Array of components (header, body, buttons) for the template
   * @returns An object containing the messageId if successful
   */
  sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    components: any[],
    credentials?: Record<string, any>
  ): Promise<{ messageId: string }>;
}
