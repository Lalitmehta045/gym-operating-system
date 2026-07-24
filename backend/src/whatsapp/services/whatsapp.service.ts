import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { WHATSAPP_PROVIDER_TOKEN, WHATSAPP_PROVIDERS_TOKEN } from '../providers/whatsapp-provider.interface.js';
import type { IWhatsAppProvider } from '../providers/whatsapp-provider.interface.js';
import { IntegrationSettingsService } from '../../settings/services/integration-settings.service.js';

interface RenewalReminderRecipient {
  tenantId: string;
  memberId: string;
  daysRemaining: number;
  paymentLink?: string;
  member: {
    firstName: string;
    phone: string;
  };
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    private prisma: PrismaService,
    private integrationSettingsService: IntegrationSettingsService,
    @Inject(WHATSAPP_PROVIDER_TOKEN)
    private readonly whatsappProvider: IWhatsAppProvider,
  ) {}

  /**
   * Core enqueue function replacing direct sending.
   * Inserts into WhatsAppLog for the Background Queue Processor to handle.
   */
  private async enqueueTemplate(
    tenantId: string,
    memberId: string,
    to: string,
    type: string,
    templateName: string,
    components: any[] = [],
    languageCode: string = 'en'
  ) {
    if (!to) {
      this.logger.warn(`Skipping WhatsApp ${type} enqueue - No phone number provided`);
      return;
    }

    try {
      await this.prisma.whatsAppLog.create({
        data: {
          tenantId,
          memberId,
          type,
          templateName,
          status: 'QUEUED',
          retryCount: 0,
          payload: {
            to,
            languageCode,
            components
          },
        },
      });
      this.logger.log(`Queued WhatsApp template '${templateName}' for member ${memberId}`);
    } catch (error) {
      this.logger.error(`Failed to enqueue WhatsApp message of type ${type}`, error);
    }
  }

  // --- Business Logic ---

  async sendWelcomeMessage(tenantId: string, memberId: string) {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId },
    });
    if (!member || !member.phone) return;

    // Throttle check
    const existing = await this.prisma.whatsAppLog.findFirst({
      where: { tenantId, memberId, type: 'WELCOME' }
    });
    if (existing) return;

    await this.enqueueTemplate(
      tenantId,
      memberId,
      member.phone,
      'WELCOME',
      'welcome_message',
      [
        {
          type: 'body',
          parameters: [{ type: 'text', text: member.firstName }]
        }
      ]
    );
  }

  async sendInvoiceGenerated(tenantId: string, memberId: string, invoiceId: string, amount: number, invoiceLink?: string) {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId },
    });
    if (!member || !member.phone) return;

    const components: any[] = [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: member.firstName },
          { type: 'text', text: amount.toString() }
        ]
      }
    ];

    if (invoiceLink) {
      components[0].parameters.push({ type: 'text', text: invoiceLink });
    }

    await this.enqueueTemplate(
      tenantId,
      memberId,
      member.phone,
      'INVOICE_GENERATED',
      'invoice_generated',
      components
    );
  }

  async sendPaymentLink(tenantId: string, memberId: string, amount: number, paymentLink: string) {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId },
    });
    if (!member || !member.phone) return;

    await this.enqueueTemplate(
      tenantId,
      memberId,
      member.phone,
      'PAYMENT_LINK',
      'payment_link',
      [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: member.firstName },
            { type: 'text', text: amount.toString() },
            { type: 'text', text: paymentLink }
          ]
        }
      ]
    );
  }

  async sendPaymentSuccess(tenantId: string, memberId: string, amount: number) {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId },
    });
    if (!member || !member.phone) return;

    await this.enqueueTemplate(
      tenantId,
      memberId,
      member.phone,
      'PAYMENT_SUCCESS',
      'payment_success',
      [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: member.firstName },
            { type: 'text', text: amount.toString() }
          ]
        }
      ]
    );
  }

  async sendPaymentFailed(tenantId: string, memberId: string, amount: number, reason?: string) {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId },
    });
    if (!member || !member.phone) return;

    await this.enqueueTemplate(
      tenantId,
      memberId,
      member.phone,
      'PAYMENT_FAILED',
      'payment_failed',
      [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: member.firstName },
            { type: 'text', text: amount.toString() },
            { type: 'text', text: reason || 'Transaction failed' }
          ]
        }
      ]
    );
  }

  async sendReceiptConfirmation(tenantId: string, memberId: string, receiptId: string, amount: number) {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId },
    });
    if (!member || !member.phone) return;

    await this.enqueueTemplate(
      tenantId,
      memberId,
      member.phone,
      'RECEIPT_CONFIRMATION',
      'receipt_confirmation',
      [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: member.firstName },
            { type: 'text', text: receiptId },
            { type: 'text', text: amount.toString() }
          ]
        }
      ]
    );
  }

  async sendAttendanceReminder(tenantId: string, memberId: string) {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId },
    });
    if (!member || !member.phone) return;

    await this.enqueueTemplate(
      tenantId,
      memberId,
      member.phone,
      'ATTENDANCE_REMINDER',
      'attendance_reminder',
      [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: member.firstName }
          ]
        }
      ]
    );
  }

  async sendStorageWarning(tenantId: string, warningLevel: number) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant || !tenant.phone) return;

    await this.enqueueTemplate(
      tenantId,
      null as any, // memberId is null for tenant
      tenant.phone,
      'SYSTEM_ALERT',
      'storage_warning',
      [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: tenant.name },
            { type: 'text', text: warningLevel.toString() }
          ]
        }
      ]
    );
  }

  // Renewal and Expiry
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

    await this.sendRenewalReminderToMember({
      tenantId,
      memberId,
      daysRemaining,
      paymentLink,
      member: {
        firstName: member.firstName,
        phone: member.phone,
      },
    });
  }

  async sendRenewalReminderToMember(
    reminder: RenewalReminderRecipient,
  ): Promise<void> {
    await this.sendRenewalRemindersBatch([reminder]);
  }

  async sendRenewalRemindersBatch(
    reminders: RenewalReminderRecipient[],
  ): Promise<void> {
    if (reminders.length === 0) return;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const existingLogs = await this.prisma.whatsAppLog.findMany({
      where: {
        OR: reminders.map((candidate) => {
          const type = candidate.daysRemaining <= 0 ? 'MEMBERSHIP_EXPIRED' : 'MEMBERSHIP_RENEWAL';
          return {
            tenantId: candidate.tenantId,
            memberId: candidate.memberId,
            type,
            createdAt: { gte: cutoff },
          };
        }),
      },
      select: {
        tenantId: true,
        memberId: true,
        type: true,
      },
    });

    const existingKeys = new Set(
      existingLogs.map(
        (log) => `${log.tenantId}:${log.memberId}:${log.type}`,
      ),
    );

    for (const candidate of reminders) {
      if (!candidate.member.phone) continue;

      const isExpired = candidate.daysRemaining <= 0;
      const type = isExpired ? 'MEMBERSHIP_EXPIRED' : 'MEMBERSHIP_RENEWAL';
      const templateName = isExpired ? 'membership_expired' : 'membership_renewal';
      
      const key = `${candidate.tenantId}:${candidate.memberId}:${type}`;
      if (existingKeys.has(key)) {
        continue;
      }

      const components: any[] = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: candidate.member.firstName },
            { type: 'text', text: candidate.daysRemaining.toString() }
          ]
        }
      ];

      if (candidate.paymentLink) {
        components[0].parameters.push({ type: 'text', text: candidate.paymentLink });
      }

      await this.enqueueTemplate(
        candidate.tenantId,
        candidate.memberId,
        candidate.member.phone,
        type,
        templateName,
        components
      );
    }
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

    const isExpired = daysRemaining <= 0;
    const type = isExpired ? 'TENANT_EXPIRED' : 'TENANT_RENEWAL';
    const templateName = isExpired ? 'tenant_expired' : 'tenant_renewal';

    const components: any[] = [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: tenant.name },
          { type: 'text', text: daysRemaining.toString() }
        ]
      }
    ];

    if (paymentLink) {
      components[0].parameters.push({ type: 'text', text: paymentLink });
    }

    await this.enqueueTemplate(
      tenantId,
      null as any,
      tenant.phone,
      type,
      templateName,
      components
    );
  }

  async processWebhook(body: any) {
    if (body.object === 'whatsapp_business_account') {
      const statusGroups: Record<string, string[]> = {};

      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.value && change.value.statuses) {
            for (const status of change.value.statuses) {
              const messageId = status.id;
              const deliveryStatus = status.status; // 'sent', 'delivered', 'read', 'failed'

              if (messageId && deliveryStatus) {
                const upperStatus = deliveryStatus.toUpperCase();
                if (!statusGroups[upperStatus]) statusGroups[upperStatus] = [];
                statusGroups[upperStatus].push(messageId);
              }
            }
          }
        }
      }

      const updatePromises = Object.entries(statusGroups).map(
        ([status, messageIds]) => {
          return this.prisma.whatsAppLog.updateMany({
            where: { messageId: { in: messageIds } },
            data: { status },
          });
        },
      );

      await Promise.all(updatePromises);
    }
  }
}
