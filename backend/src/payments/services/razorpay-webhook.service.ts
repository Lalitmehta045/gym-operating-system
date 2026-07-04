import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
import { IntegrationSettingsService } from '../../settings/services/integration-settings.service.js';
import { randomUUID } from 'crypto';
import { PaymentStatus, SubscriptionStatus, PaymentMethod } from '../../../generated/prisma/client.js';

@Injectable()
export class RazorpayWebhookService {
  private readonly logger = new Logger(RazorpayWebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly integrationSettingsService: IntegrationSettingsService,
  ) {}

  async processWebhook(
    rawBody: Buffer | string,
    signature: string,
    parsedBody: any,
  ): Promise<void> {
    const event = parsedBody.event;
    this.logger.log(`Received Razorpay webhook: ${event}`);

    // Only process payment_link.paid events
    if (event !== 'payment_link.paid') {
      this.logger.log(`Ignoring event type: ${event}`);
      return;
    }

    const paymentLinkEntity = parsedBody.payload?.payment_link?.entity;
    const paymentEntity = parsedBody.payload?.payment?.entity;

    if (!paymentLinkEntity || !paymentEntity) {
      this.logger.warn('Missing payment_link or payment entity in webhook');
      return;
    }

    const notes = paymentLinkEntity.notes || {};
    const tenantId = notes.tenantId;
    const memberId = notes.memberId;
    const subscriptionId = notes.subscriptionId;

    if (!tenantId || !memberId) {
      this.logger.warn('Missing tenantId/memberId in payment link notes');
      return;
    }

    // CRITICAL: Verify webhook signature using THIS tenant's webhook secret
    const settings = await this.integrationSettingsService.getRawSettings(tenantId);
    if (!settings?.razorpayWebhookSecret) {
      this.logger.error(`No webhook secret configured for tenant ${tenantId}`);
      return;
    }

    const isValid = this.verifySignature(
      rawBody,
      signature,
      settings.razorpayWebhookSecret
    );

    if (!isValid) {
      this.logger.error(`Invalid webhook signature for tenant ${tenantId}`);
      return; // Do not process if signature invalid
    }

    // Idempotency check - has this payment already been processed?
    const existingPayment = await this.prisma.payment.findFirst({
      where: { 
        tenantId,
        razorpayPaymentId: paymentEntity.id,
      }
    });

    if (existingPayment) {
      this.logger.log(`Payment ${paymentEntity.id} already processed, skipping`);
      return;
    }

    // Process payment in transaction
    await this.prisma.$transaction(async (tx) => {
      const amount = paymentEntity.amount / 100; // paise to rupees
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}-${randomUUID().slice(-8).toUpperCase()}`;

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          tenantId,
          memberId,
          subscriptionId: subscriptionId || null,
          amount,
          paymentMethod: PaymentMethod.UPI, // Razorpay link payments default
          paymentStatus: PaymentStatus.PAID,
          razorpayPaymentId: paymentEntity.id,
          razorpayOrderId: paymentEntity.order_id || null,
          gateway: 'razorpay',
          gatewayStatus: paymentEntity.status,
          gatewayPayload: parsedBody,
          paidAt: new Date(),
          notes: 'Paid via WhatsApp Razorpay link',
        },
      });

      // Activate subscription if linked
      if (subscriptionId) {
        await tx.subscription.update({
          where: { id: subscriptionId },
          data: { status: SubscriptionStatus.ACTIVE },
        });
      }

      // Generate invoice
      await tx.invoice.create({
        data: {
          tenantId,
          memberId,
          subscriptionId: subscriptionId || null,
          paymentId: payment.id,
          invoiceNumber,
          amount: payment.amount,
        },
      });

      this.logger.log(
        ` Auto-processed Razorpay payment for member ${memberId}, subscription ${subscriptionId}`
      );
    });

    // Send WhatsApp confirmation (fire and forget)
    this.sendPaymentConfirmation(tenantId, memberId, paymentEntity.amount / 100, settings)
      .catch(err => this.logger.error('Failed to send payment confirmation:', err));
  }

  private verifySignature(
    rawBody: Buffer | string,
    signature: string,
    webhookSecret: string,
  ): boolean {
    if (!signature) return false;
    
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    return expectedSignature === signature;
  }

  private async sendPaymentConfirmation(
    tenantId: string,
    memberId: string,
    amount: number,
    settings: any,
  ): Promise<void> {
    if (!settings.whatsappEnabled || !settings.whatsappPhoneNumberId) return;

    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId },
    });

    if (!member?.phone) return;

    const phone = member.phone.replace(/\D/g, '');
    const whatsappPhone = phone.startsWith('91') ? phone : `91${phone}`;

    const message = ` Payment Received!\n\nHi ${member.firstName}, we've received your payment of ₹${amount.toLocaleString('en-IN')}.\n\nYour membership has been renewed. Thank you! `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      await fetch(
        `https://graph.facebook.com/v18.0/${settings.whatsappPhoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${settings.whatsappAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: whatsappPhone,
            type: 'text',
            text: { body: message }
          }),
          signal: controller.signal,
        }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    await this.prisma.whatsAppLog.create({
      data: {
        tenantId,
        memberId,
        type: 'PAYMENT_SUCCESS',
        status: 'SENT',
      }
    });
  }
}
