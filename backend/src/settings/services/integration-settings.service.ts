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
    whatsappPhoneNumberId?: string;
    whatsappAccessToken?: string;
    whatsappBusinessId?: string;
    whatsappEnabled?: boolean;
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
    return {
      ...settings,
      razorpayKeySecret: settings.razorpayKeySecret 
        ? '****' + settings.razorpayKeySecret.slice(-4) 
        : null,
      razorpayWebhookSecret: settings.razorpayWebhookSecret 
        ? '********' 
        : null,
      whatsappAccessToken: settings.whatsappAccessToken 
        ? '****' + settings.whatsappAccessToken.slice(-4) 
        : null,
    };
  }
}
