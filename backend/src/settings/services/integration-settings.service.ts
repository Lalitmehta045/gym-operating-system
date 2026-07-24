import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class IntegrationSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // Get settings for a tenant (create if not exists)
  async getSettings(tenantId: string) {
    let settings = await this.prisma.tenantIntegrationSettings.findUnique({
      where: { tenantId }
    });
    
    if (!settings) {
      settings = await this.prisma.tenantIntegrationSettings.create({
        data: { tenantId }
      });
    }

    // Never return raw secrets - mask them
    return this.maskSecrets(settings);
  }

  // Update Razorpay settings
  async updateRazorpaySettings(tenantId: string, dto: {
    razorpayKeyId?: string;
    razorpayKeySecret?: string;
    razorpayWebhookSecret?: string;
    razorpayEnabled?: boolean;
  }) {
    const settings = await this.prisma.tenantIntegrationSettings.upsert({
      where: { tenantId },
      create: { tenantId, ...dto },
      update: dto,
      select: {
        id: true,
        updatedAt: true,
      },
    });

    return { ...settings, success: true };
  }

  // Update WhatsApp settings
  async updateWhatsappSettings(tenantId: string, dto: {
    whatsappProvider?: string;
    whatsappPhoneNumberId?: string;
    whatsappAccessToken?: string;
    whatsappBusinessId?: string;
    whatsappAuthKey?: string;
    whatsappIntegratedNumber?: string;
    whatsappAccountSid?: string;
    whatsappAuthToken?: string;
    whatsappWhatsAppNumber?: string;
    whatsappApiKey?: string;
    whatsappEnabled?: boolean;
  }) {
    // Map legacy flat DTO to the new whatsappCredentials JSON structure
    const credentials: any = {};
    if (dto.whatsappPhoneNumberId) credentials.whatsappPhoneNumberId = dto.whatsappPhoneNumberId;
    if (dto.whatsappAccessToken) credentials.whatsappAccessToken = dto.whatsappAccessToken;
    if (dto.whatsappBusinessId) credentials.whatsappBusinessId = dto.whatsappBusinessId;
    if (dto.whatsappAuthKey) credentials.authKey = dto.whatsappAuthKey;
    if (dto.whatsappIntegratedNumber) credentials.integratedNumber = dto.whatsappIntegratedNumber;
    if (dto.whatsappAccountSid) credentials.accountSid = dto.whatsappAccountSid;
    if (dto.whatsappAuthToken) credentials.authToken = dto.whatsappAuthToken;
    if (dto.whatsappWhatsAppNumber) credentials.whatsappNumber = dto.whatsappWhatsAppNumber;
    if (dto.whatsappApiKey) credentials.apiKey = dto.whatsappApiKey;

    const data: any = {};
    if (dto.whatsappEnabled !== undefined) data.whatsappEnabled = dto.whatsappEnabled;
    if (dto.whatsappProvider) data.whatsappProvider = dto.whatsappProvider;
    if (Object.keys(credentials).length > 0) data.whatsappCredentials = credentials;

    const settings = await this.prisma.tenantIntegrationSettings.upsert({
      where: { tenantId },
      create: { tenantId, ...data },
      update: data,
      select: {
        id: true,
        updatedAt: true,
      },
    });

    return { ...settings, success: true };
  }

  // Update notification preferences
  async updateNotificationPrefs(tenantId: string, dto: {
    notifyExpiringDays?: number;
    notifyOnPayment?: boolean;
    notifyOnExpiry?: boolean;
  }) {
    const settings = await this.prisma.tenantIntegrationSettings.upsert({
      where: { tenantId },
      create: { tenantId, ...dto },
      update: dto,
      select: {
        id: true,
        updatedAt: true,
      },
    });

    return { ...settings, success: true };
  }

  // Get raw settings (for internal service use only - NOT for API response)
  async getRawSettings(tenantId: string) {
    return this.prisma.tenantIntegrationSettings.findUnique({
      where: { tenantId }
    });
  }

  // Mask secrets for API response
  private maskSecrets(settings: any) {
    // Unpack credentials for backward compatibility with frontend
    const creds = settings.whatsappCredentials || {};
    
    return {
      ...settings,
      ...creds,
      razorpayKeySecret: settings.razorpayKeySecret 
        ? '****' + settings.razorpayKeySecret.slice(-4) 
        : null,
      razorpayWebhookSecret: settings.razorpayWebhookSecret 
        ? '********' 
        : null,
      whatsappAccessToken: creds.whatsappAccessToken 
        ? '****' + creds.whatsappAccessToken.slice(-4) 
        : null,
      whatsappAuthKey: creds.authKey 
        ? '****' + creds.authKey.slice(-4) 
        : null,
      whatsappAuthToken: creds.authToken 
        ? '****' + creds.authToken.slice(-4) 
        : null,
      whatsappApiKey: creds.apiKey 
        ? '****' + creds.apiKey.slice(-4) 
        : null,
    };
  }
}
