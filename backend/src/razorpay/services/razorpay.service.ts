import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { VerifyPaymentDto } from '../dto/verify-payment.dto.js';
import { CreateOrderDto } from '../dto/create-order.dto.js';
import { CreateTenantOrderDto } from '../dto/create-tenant-order.dto.js';
import { VerifyTenantPaymentDto } from '../dto/verify-tenant-payment.dto.js';
import {
  PaymentStatus,
  PaymentMethod,
  SubscriptionStatus,
} from '../../../generated/prisma/client.js';
import { WhatsappService } from '../../whatsapp/services/whatsapp.service.js';
import { TenantSubscriptionService } from '../../tenant-subscription/services/tenant-subscription.service.js';
import { AuditService } from '../../audit/audit.service.js';
import { AuditEntity, AuditAction } from '../../../generated/prisma/client.js';
import { PAYMENT_PROVIDER_TOKEN } from '../providers/payment-provider.interface.js';
import type { IPaymentProvider } from '../providers/payment-provider.interface.js';
import crypto from 'crypto';

interface RenewalPaymentLinkData {
  tenantId: string;
  subscriptionId: string;
  amount: string | number;
  subscriptionDeletedAt?: string | null;
  member: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    deletedAt?: string | null;
  };
}

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
    private readonly tenantSubscriptionService: TenantSubscriptionService,
    private readonly auditService: AuditService,
    @Inject(PAYMENT_PROVIDER_TOKEN) private readonly paymentProvider: IPaymentProvider,
  ) {}

  async createOrder(tenantId: string, dto: CreateOrderDto) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { id: dto.subscriptionId, tenantId, deletedAt: null },
      include: { membershipPlan: true, member: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const invoice = await this.prisma.invoice.findFirst({
      where: { subscriptionId: subscription.id, tenantId, status: { in: ['DUE', 'PARTIALLY_PAID'] } },
    });

    if (!invoice) {
      throw new BadRequestException('No pending invoice found for this subscription');
    }

    // Determine the amount remaining to be paid
    // Ideally, we'd subtract already paid amount from invoice.amount. For simplicity, we'll use invoice amount.
    const amountToPay = Number(invoice.amount);

    // Amount in paise (multiply by 100)
    const amountInPaise = Math.round(amountToPay * 100);

    let order;
    try {
      order = await this.paymentProvider.createOrder({
        amount: amountInPaise,
        currency: 'INR',
        receipt: invoice.invoiceNumber || `receipt_${subscription.id.substring(0, 8)}`,
        notes: {
          subscriptionId: subscription.id,
          invoiceId: invoice.id,
          tenantId,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create payment order', error);
      throw new InternalServerErrorException('Failed to create payment order');
    }

    // Create a pending payment record
    await this.prisma.payment.create({
      data: {
        tenantId,
        memberId: subscription.memberId,
        subscriptionId: subscription.id,
        invoiceId: invoice.id,
        amount: amountToPay,
        paymentMethod: PaymentMethod.CARD, // Default for gateway
        paymentStatus: PaymentStatus.PENDING,
        razorpayOrderId: order.id,
        gateway: 'RAZORPAY',
        gatewayStatus: 'created',
      },
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'mock_key',
    };
  }

  async createPaymentLink(
    tenantId: string,
    subscriptionId: string,
    memberId: string,
  ) {
    if (!this.paymentProvider) {
      return null;
    }

    // Parallelize independent DB queries
    const [subscription, member] = await Promise.all([
      this.prisma.subscription.findFirst({
        where: { id: subscriptionId, tenantId, deletedAt: null },
      }),
      this.prisma.member.findFirst({
        where: { id: memberId, tenantId, deletedAt: null },
      }),
    ]);

    if (!subscription || !member) return null;

    const invoice = await this.prisma.invoice.findFirst({
      where: { subscriptionId: subscription.id, tenantId, status: { in: ['DUE', 'PARTIALLY_PAID'] } },
    });

    if (!invoice) return null;

    try {
      const amountInPaise = Math.round(Number(invoice.amount) * 100);
      const paymentLink = await this.paymentProvider.createPaymentLink({
        amount: amountInPaise,
        currency: 'INR',
        description: 'Gym Membership Invoice Payment',
        customer: {
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          contact: member.phone,
        },
        notes: {
          subscriptionId: subscription.id,
          invoiceId: invoice.id,
          tenantId: tenantId,
        },
      });

      return paymentLink;
    } catch (error) {
      this.logger.error('Failed to create Razorpay payment link', error);
      return null;
    }
  }

  async createPaymentLinkFromSubscription(data: RenewalPaymentLinkData) {
    if (!this.paymentProvider) {
      return null;
    }

    if (data.subscriptionDeletedAt || data.member.deletedAt) {
      return null;
    }

    // Try to find the associated invoice
    const invoice = await this.prisma.invoice.findFirst({
      where: { subscriptionId: data.subscriptionId, tenantId: data.tenantId, status: { in: ['DUE', 'PARTIALLY_PAID'] } },
    });

    if (!invoice) return null;

    try {
      const amountInPaise = Math.round(Number(invoice.amount) * 100);
      const paymentLink = await this.paymentProvider.createPaymentLink({
        amount: amountInPaise,
        currency: 'INR',
        description: 'Gym Membership Renewal',
        customer: {
          name: `${data.member.firstName} ${data.member.lastName}`,
          email: data.member.email,
          contact: data.member.phone,
        },
        notes: {
          subscriptionId: data.subscriptionId,
          invoiceId: invoice.id,
          tenantId: data.tenantId,
        },
      });

      return paymentLink;
    } catch (error) {
      this.logger.error('Failed to create Razorpay payment link', error);
      return null;
    }
  }

  async verifyPayment(tenantId: string, dto: VerifyPaymentDto) {
    if (!process.env.RAZORPAY_KEY_SECRET && process.env.PAYMENT_PROVIDER !== 'mock') {
      throw new InternalServerErrorException('Razorpay secret not configured');
    }

    // 1. Verify Signature
    const isValidSignature = this.paymentProvider.verifyPaymentSignature(
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET || 'mock_secret'
    );

    if (!isValidSignature) {
      throw new BadRequestException('Invalid payment signature');
    }

    // 2. Prevent Duplicate Processing & find payment
    const payment = await this.prisma.payment.findFirst({
      where: {
        tenantId,
        razorpayOrderId: dto.razorpay_order_id,
        deletedAt: null,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found for this order');
    }

    if (payment.paymentStatus === PaymentStatus.PAID) {
      return { success: true, message: 'Payment was already processed' };
    }

    // 3. Perform Transactional Updates with Idempotency
    try {
      await this.prisma.$transaction(async (tx) => {
        // Mark Payment as PAID (Atomic Check)
        const updateResult = await tx.payment.updateMany({
          where: { id: payment.id, paymentStatus: PaymentStatus.PENDING },
          data: {
            paymentStatus: PaymentStatus.PAID,
            razorpayPaymentId: dto.razorpay_payment_id,
            razorpaySignature: dto.razorpay_signature,
            gatewayStatus: 'captured',
            paidAt: new Date(),
          },
        });

        if (updateResult.count === 0) {
          throw new Error('ALREADY_PROCESSED');
        }

        if (payment.invoiceId) {
          await tx.invoice.update({
            where: { id: payment.invoiceId },
            data: { status: 'PAID' }
          });
        }

        // Optionally, Create Notification
        await tx.notification.create({
          data: {
            tenantId,
            memberId: payment.memberId,
            type: 'PAYMENT_RECEIVED',
            title: 'Payment Successful',
            message: `Your payment of ${payment.amount} has been successfully processed.`,
          },
        });

      });
    } catch (error) {
      if (error instanceof Error && error.message === 'ALREADY_PROCESSED') {
        return { success: true, message: 'Payment was already processed' };
      }
      throw error;
    }


    await this.auditService.createLog({
      tenantId,
      userId: payment.memberId,
      memberId: payment.memberId,
      entity: AuditEntity.PAYMENT,
      entityId: payment.id,
      action: AuditAction.PAYMENT_SUCCESS,
      description: 'Payment Verification Successful',
    });

    if (payment.invoiceId) {
      await this.auditService.createLog({
        tenantId,
        userId: payment.memberId,
        memberId: payment.memberId,
        entity: AuditEntity.INVOICE,
        entityId: payment.invoiceId,
        action: AuditAction.UPDATE,
        description: 'Invoice marked as PAID',
      });
    }

    this.whatsappService
      .sendPaymentSuccess(tenantId, payment.memberId, Number(payment.amount))
      .catch((err) =>
        this.logger.error('Failed to send payment success WhatsApp', err),
      );
    return { success: true };
  }

  async handleWebhook(signature: string, rawBody: Buffer, body: any) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_secret';
    if (!secret && process.env.PAYMENT_PROVIDER !== 'mock') {
      this.logger.warn('Webhook secret not configured');
      return { status: 'ignored' };
    }

    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    // Verify webhook signature with raw payload
    const isValidSignature = this.paymentProvider.verifySignature(signature, rawBody, secret);

    if (!isValidSignature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = body.event;
    const paymentEntity = body.payload.payment.entity;

    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;

    if (!razorpayOrderId) {
      return { status: 'ignored' };
    }

    const payment = await this.prisma.payment.findFirst({
      where: { razorpayOrderId },
    });

    if (!payment) {
      this.logger.warn(
        `Webhook received for unknown order: ${razorpayOrderId}`,
      );
      return { status: 'ignored' };
    }

    if (event === 'payment.captured') {
      if (payment.paymentStatus === PaymentStatus.PAID) {
        return { status: 'already_processed' };
      }
      let capturedInvoiceId: string | null = null;
      let shouldNotifyPaymentSuccess = false;


      try {
        await this.prisma.$transaction(async (tx) => {
          const updateResult = await tx.payment.updateMany({
            where: { id: payment.id, paymentStatus: PaymentStatus.PENDING },
            data: {
              paymentStatus: PaymentStatus.PAID,
              razorpayPaymentId,
              gatewayStatus: 'captured',
              paidAt: new Date(),
            },
          });

          if (updateResult.count === 0) {
            throw new Error('ALREADY_PROCESSED');
          }

          if (payment.invoiceId) {
            await tx.invoice.update({
              where: { id: payment.invoiceId },
              data: { status: 'PAID' }
            });
            shouldNotifyPaymentSuccess = true;
          }
        });
      } catch (error) {
        if (error instanceof Error && error.message === 'ALREADY_PROCESSED') {
          return { status: 'already_processed' };
        }
        throw error;
      }

      if (shouldNotifyPaymentSuccess) {
        await this.auditService.createLog({
          tenantId: payment.tenantId,
          userId: payment.memberId,
          memberId: payment.memberId,
          entity: AuditEntity.PAYMENT,
          entityId: payment.id,
          action: AuditAction.PAYMENT_SUCCESS,
          description: 'Webhook: Payment Captured',
        });

        if (payment.invoiceId) {
          await this.auditService.createLog({
            tenantId: payment.tenantId,
            userId: payment.memberId,
            memberId: payment.memberId,
            entity: AuditEntity.INVOICE,
            entityId: payment.invoiceId,
            action: AuditAction.UPDATE,
            description: 'Invoice marked as PAID from webhook',
          });
        }

        this.whatsappService
          .sendPaymentSuccess(payment.tenantId, payment.memberId, Number(payment.amount))
          .catch((err) =>
            this.logger.error('Failed to send webhook payment WhatsApp', err),
          );
      }
    } else if (event === 'payment.failed') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          paymentStatus: PaymentStatus.FAILED,
          razorpayPaymentId,
          gatewayStatus: 'failed',
        },
      });
    } else if (event === 'refund.processed') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          paymentStatus: PaymentStatus.REFUNDED,
          gatewayStatus: 'refunded',
        },
      });
    }

    return { status: 'ok' };
  }

  // Tenant SaaS Billing

  async createTenantOrder(tenantId: string, dto: CreateTenantOrderDto) {
    if (!this.paymentProvider) {
      throw new InternalServerErrorException(
        'Payment Provider is not configured on the server',
      );
    }

    const plan = await this.prisma.platformPlan.findUnique({
      where: { id: dto.planId, isActive: true },
    });

    if (!plan) {
      throw new NotFoundException('Platform plan not found');
    }

    const invoiceNumber =
      await this.tenantSubscriptionService.generateInvoiceNumber();

    const tenantInvoice = await this.prisma.tenantInvoice.create({
      data: {
        tenantId,
        platformPlanId: plan.id,
        invoiceNumber,
        amount: plan.price,
        status: PaymentStatus.PENDING,
        gateway: 'RAZORPAY',
        gatewayStatus: 'created',
      },
    });

    const amountInPaise = Math.round(Number(plan.price) * 100);

    let order;
    try {
      order = await this.paymentProvider.createOrder({
        amount: amountInPaise,
        currency: 'INR',
        receipt: invoiceNumber,
        notes: {
          tenantId,
          planId: plan.id,
          invoiceId: tenantInvoice.id,
        },
      });
    } catch (error) {
      throw error;
    }

    await this.prisma.tenantInvoice.update({
      where: { id: tenantInvoice.id },
      data: { razorpayOrderId: order.id },
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  async verifyTenantPayment(tenantId: string, dto: VerifyTenantPaymentDto) {
    if (!process.env.RAZORPAY_KEY_SECRET && process.env.PAYMENT_PROVIDER !== 'mock') {
      throw new InternalServerErrorException('Razorpay secret not configured');
    }

    const isValidSignature = this.paymentProvider.verifyPaymentSignature(
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET || 'mock_secret'
    );

    if (!isValidSignature) {
      throw new BadRequestException('Invalid payment signature');
    }

    const invoice = await this.prisma.tenantInvoice.findFirst({
      where: {
        tenantId,
        razorpayOrderId: dto.razorpay_order_id,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Tenant invoice not found for this order');
    }

    if (invoice.status === PaymentStatus.PAID) {
      return { success: true, message: 'Payment was already processed' };
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        const updateResult = await tx.tenantInvoice.updateMany({
          where: { id: invoice.id, status: PaymentStatus.PENDING },
          data: {
            status: PaymentStatus.PAID,
            razorpayPaymentId: dto.razorpay_payment_id,
            razorpaySignature: dto.razorpay_signature,
            gatewayStatus: 'captured',
            paidAt: new Date(),
          },
        });

        if (updateResult.count === 0) {
          throw new Error('ALREADY_PROCESSED');
        }

        await this.tenantSubscriptionService.activateSubscription(
          tenantId,
          invoice.platformPlanId!,
          invoice.id,
          tx,
        );
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'ALREADY_PROCESSED') {
        return { success: true, message: 'Payment was already processed' };
      }
      throw error;
    }

    return { success: true };
  }

  async handleTenantWebhook(signature: string, rawBody: Buffer, body: any) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_secret';
    if (!secret && process.env.PAYMENT_PROVIDER !== 'mock') {
      this.logger.warn('Webhook secret not configured');
      return { status: 'ignored' };
    }

    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    const isValidSignature = this.paymentProvider.verifySignature(signature, rawBody, secret);

    if (!isValidSignature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = body.event;
    const paymentEntity = body.payload?.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id;

    if (!razorpayOrderId) {
      return { status: 'ignored' };
    }

    const invoice = await this.prisma.tenantInvoice.findFirst({
      where: { razorpayOrderId },
    });

    if (!invoice) {
      this.logger.warn(
        `Tenant webhook received for unknown order: ${razorpayOrderId}`,
      );
      return { status: 'ignored' };
    }

    if (event === 'payment.captured') {
      if (invoice.status === PaymentStatus.PAID) {
        return { status: 'already_processed' };
      }

      try {
        await this.prisma.$transaction(async (tx) => {
          const updateResult = await tx.tenantInvoice.updateMany({
            where: { id: invoice.id, status: PaymentStatus.PENDING },
            data: {
              status: PaymentStatus.PAID,
              razorpayPaymentId: paymentEntity.id,
              gatewayStatus: 'captured',
              paidAt: new Date(),
            },
          });

          if (updateResult.count === 0) {
            throw new Error('ALREADY_PROCESSED');
          }

          await this.tenantSubscriptionService.activateSubscription(
            invoice.tenantId,
            invoice.platformPlanId!,
            invoice.id,
            tx,
          );
        });
      } catch (error) {
        if (error instanceof Error && error.message === 'ALREADY_PROCESSED') {
          return { status: 'already_processed' };
        }
        throw error;
      }
    } else if (event === 'payment.failed') {
      await this.prisma.tenantInvoice.update({
        where: { id: invoice.id },
        data: {
          status: PaymentStatus.FAILED,
          gatewayStatus: 'failed',
        },
      });
    }

    return { status: 'ok' };
  }

  // The retry logic is now in real-razorpay.provider.ts
}
