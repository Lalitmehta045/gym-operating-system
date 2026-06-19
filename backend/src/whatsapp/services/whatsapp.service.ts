import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import axios from 'axios';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly apiUrl = 'https://graph.facebook.com/v19.0'; // Or whichever version is current

  constructor(private prisma: PrismaService) {}

  private get isConfigured(): boolean {
    return !!(
      process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
    );
  }

  async sendMessage(
    to: string,
    text: string,
    tenantId?: string,
    memberId?: string,
    type?: string,
  ) {
    if (!this.isConfigured) {
      this.logger.warn('WhatsApp is not configured. Message not sent.');
      return null;
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: text },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const messageId = response.data.messages?.[0]?.id;

      if (tenantId && type) {
        await this.prisma.whatsAppLog.create({
          data: {
            tenantId,
            memberId,
            messageId,
            type,
            status: 'SENT',
          },
        });
      }

      return response.data;
    } catch (error: any) {
      this.logger.error(
        'Failed to send WhatsApp message',
        error.response?.data || error.message,
      );

      if (tenantId && type) {
        await this.prisma.whatsAppLog.create({
          data: {
            tenantId,
            memberId,
            type,
            status: 'FAILED',
            metadata: { error: error.response?.data || error.message },
          },
        });
      }
      throw error;
    }
  }

  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    components: any[] = [],
    tenantId?: string,
    memberId?: string,
    type?: string,
  ) {
    if (!this.isConfigured) {
      this.logger.warn('WhatsApp is not configured. Template not sent.');
      return null;
    }

    try {
      const response = await axios.post(
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
        },
      );

      const messageId = response.data.messages?.[0]?.id;

      if (tenantId && type) {
        await this.prisma.whatsAppLog.create({
          data: {
            tenantId,
            memberId,
            messageId,
            type,
            status: 'SENT',
          },
        });
      }

      return response.data;
    } catch (error: any) {
      this.logger.error(
        'Failed to send WhatsApp template',
        error.response?.data || error.message,
      );

      if (tenantId && type) {
        await this.prisma.whatsAppLog.create({
          data: {
            tenantId,
            memberId,
            type,
            status: 'FAILED',
            metadata: { error: error.response?.data || error.message },
          },
        });
      }
      throw error;
    }
  }

  private async canSendMessage(
    tenantId: string,
    memberId: string,
    type: string,
    timeframeDays: number = 0,
  ): Promise<boolean> {
    const whereClause: any = {
      tenantId,
      memberId,
      type,
    };

    if (timeframeDays > 0) {
      const date = new Date();
      date.setDate(date.getDate() - timeframeDays);
      whereClause.createdAt = { gte: date };
    }

    const existingLog = await this.prisma.whatsAppLog.findFirst({
      where: whereClause,
    });

    return !existingLog;
  }

  async sendRenewalReminder(
    tenantId: string,
    memberId: string,
    daysRemaining: number,
    paymentLink?: string,
  ) {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId },
    });
    if (!member || !member.phone) return;

    let type = '';
    let text = '';

    if (daysRemaining === 0) {
      type = 'EXPIRING_0_DAYS';
      text = `Hi ${member.firstName}, your gym membership has expired today. `;
    } else {
      type = `EXPIRING_${daysRemaining}_DAYS`;
      text = `Hi ${member.firstName}, your gym membership expires in ${daysRemaining} day(s). `;
    }

    if (paymentLink) {
      text += `Renew here: ${paymentLink}`;
    } else {
      text += `Please renew soon to continue access.`;
    }

    // Check duplicate logic. If we already sent this specific reminder type recently (e.g. within 30 days)
    const canSend = await this.canSendMessage(tenantId, memberId, type, 30);
    if (!canSend) {
      this.logger.log(
        `Skipping duplicate WhatsApp reminder of type ${type} for member ${memberId}`,
      );
      return;
    }

    await this.sendMessage(member.phone, text, tenantId, memberId, type);
  }

  async sendPaymentSuccess(tenantId: string, memberId: string, amount: number) {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId },
    });
    if (!member || !member.phone) return;

    const type = 'PAYMENT_SUCCESS';
    const text = `Hi ${member.firstName}, we have successfully received your payment of ${amount}. Thank you!`;

    await this.sendMessage(member.phone, text, tenantId, memberId, type);
  }

  async sendWelcomeMessage(tenantId: string, memberId: string) {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId },
    });
    if (!member || !member.phone) return;

    const type = 'WELCOME';
    const text = `Hi ${member.firstName}, welcome to the gym! We are excited to have you onboard.`;

    const canSend = await this.canSendMessage(tenantId, memberId, type);
    if (!canSend) return;

    await this.sendMessage(member.phone, text, tenantId, memberId, type);
  }

  async sendTenantRenewalReminder(
    tenantId: string,
    daysRemaining: number,
    paymentLink?: string,
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant || !tenant.phone) return;

    let type = '';
    let text = '';

    if (daysRemaining === 0) {
      type = 'TENANT_EXPIRING_0_DAYS';
      text = `Hi ${tenant.name}, your NexUp Fit subscription has expired today. `;
    } else {
      type = `TENANT_EXPIRING_${daysRemaining}_DAYS`;
      text = `Hi ${tenant.name}, your NexUp Fit subscription expires in ${daysRemaining} day(s). `;
    }

    if (paymentLink) {
      text += `Renew here: ${paymentLink}`;
    } else {
      text += `Please renew soon to continue access.`;
    }

    await this.sendMessage(tenant.phone, text, tenantId, undefined, type);
  }

  async processWebhook(body: any) {
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value && change.value.statuses) {
            for (const status of change.value.statuses) {
              const messageId = status.id;
              const deliveryStatus = status.status; // 'sent', 'delivered', 'read', 'failed'

              if (messageId) {
                // Update log
                await this.prisma.whatsAppLog.updateMany({
                  where: { messageId },
                  data: { status: deliveryStatus.toUpperCase() },
                });
              }
            }
          }
        }
      }
    }
  }
}
