import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
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
import { ExternalServiceCall } from '../../common/utils/circuit-breaker.util.js';
import { AuditService } from '../../audit/audit.service.js';
import { AuditEntity, AuditAction } from '../../../generated/prisma/client.js';

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
  private razorpay: Razorpay;
  private readonly logger = new Logger(RazorpayService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
    private readonly tenantSubscriptionService: TenantSubscriptionService,
    private readonly auditService: AuditService,
  ) {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    } else {
      this.logger.warn('Razorpay credentials not configured.');
    }
  }

  async createOrder(tenantId: string, dto: CreateOrderDto) {
    if (!this.razorpay) {
      throw new InternalServerErrorException(
        'Razorpay is not configured on the server',
      );
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: { id: dto.subscriptionId, tenantId, deletedAt: null },
      include: { membershipPlan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('Subscription is already active');
    }

    // Amount in paise (multiply by 100)
    const amountInPaise = Math.round(Number(subscription.amount) * 100);

    let order;
    try {
      order = await this.createRazorpayOrderWithRetry({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${subscription.id.substring(0, 8)}`,
        notes: {
          subscriptionId: subscription.id,
          tenantId,
        },
      });
    } catch (error) {
      throw error;
    }

    // Create a pending payment record
    await this.prisma.payment.create({
      data: {
        tenantId,
        memberId: subscription.memberId,
        subscriptionId: subscription.id,
        amount: subscription.amount,
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
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  async createPaymentLink(
    tenantId: string,
    subscriptionId: string,
    memberId: string,
  ) {
    if (!this.razorpay) {
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

    return this.createPaymentLinkFromSubscription({
      tenantId,
      subscriptionId: subscription.id,
      amount: subscription.amount.toString(),
      subscriptionDeletedAt: null,
      member: {
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        deletedAt: null,
      },
    });
  }

  async createPaymentLinkFromSubscription(data: RenewalPaymentLinkData) {
    if (!this.razorpay) {
      return null;
    }

    if (data.subscriptionDeletedAt || data.member.deletedAt) {
      return null;
    }

    try {
      const amountInPaise = Math.round(Number(data.amount) * 100);
      const paymentLink = await ExternalServiceCall.execute(
        'razorpay-create-payment-link',
        () => this.razorpay.paymentLink.create({
          amount: amountInPaise,
          currency: 'INR',
          accept_partial: false,
          description: 'Gym Membership Renewal',
          customer: {
            name: `${data.member.firstName} ${data.member.lastName}`,
            email: data.member.email,
            contact: data.member.phone,
          },
          notify: {
            sms: false,
            email: false,
          },
          reminder_enable: false,
          notes: {
            subscriptionId: data.subscriptionId,
            tenantId: data.tenantId,
          },
        }),
        () => {
          this.logger.error('Razorpay paymentLink.create degraded response (Fallback)');
          return { short_url: '' } as any;
        },
        { timeout: 6000 }
      );

      return paymentLink.short_url;
    } catch (error) {
      this.logger.error('Failed to create Razorpay payment link', error);
      return null;
    }
  }

  async verifyPayment(tenantId: string, dto: VerifyPaymentDto) {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new InternalServerErrorException('Razorpay secret not configured');
    }

    // 1. Verify Signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${dto.razorpay_order_id}|${dto.razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== dto.razorpay_signature) {
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

    let createdInvoiceId: string | null = null;

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

        // Update Subscription Status
        await tx.subscription.update({
          where: { id: payment.subscriptionId! },
          data: {
            status: SubscriptionStatus.ACTIVE,
          },
        });

        // Generate Invoice Number
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const uniqueSuffix = crypto
          .randomBytes(3)
          .toString('hex')
          .toUpperCase();
        const invoiceNumber = `INV-${dateStr}-${uniqueSuffix}`;

        // Create Invoice
        const invoice = await tx.invoice.create({
          data: {
            tenantId,
            memberId: payment.memberId,
            subscriptionId: payment.subscriptionId,
            paymentId: payment.id,
            invoiceNumber,
            amount: payment.amount,
            notes: 'Auto-generated invoice from Razorpay payment',
          },
        });

        createdInvoiceId = invoice.id;
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

    if (createdInvoiceId) {
      await this.auditService.createLog({
        tenantId,
        userId: payment.memberId,
        memberId: payment.memberId,
        entity: AuditEntity.INVOICE,
        entityId: createdInvoiceId,
        action: AuditAction.CREATE,
        description: 'Invoice Generated',
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
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      this.logger.warn('Webhook secret not configured');
      return { status: 'ignored' };
    }

    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    // Verify webhook signature with raw payload
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
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

          if (payment.subscriptionId) {
            await tx.subscription.update({
              where: { id: payment.subscriptionId },
              data: { status: SubscriptionStatus.ACTIVE },
            });

            const dateStr = new Date()
              .toISOString()
              .slice(0, 10)
              .replace(/-/g, '');
            const uniqueSuffix = crypto
              .randomBytes(3)
              .toString('hex')
              .toUpperCase();
            const invoiceNumber = `INV-${dateStr}-${uniqueSuffix}`;

            const invoice = await tx.invoice.create({
              data: {
                tenantId: payment.tenantId,
                memberId: payment.memberId,
                subscriptionId: payment.subscriptionId,
                paymentId: payment.id,
                invoiceNumber,
                amount: payment.amount,
              },
            });

            capturedInvoiceId = invoice.id;
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

        if (capturedInvoiceId) {
          await this.auditService.createLog({
            tenantId: payment.tenantId,
            userId: payment.memberId,
            memberId: payment.memberId,
            entity: AuditEntity.INVOICE,
            entityId: capturedInvoiceId,
            action: AuditAction.CREATE,
            description: 'Invoice Generated',
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
    if (!this.razorpay) {
      throw new InternalServerErrorException(
        'Razorpay is not configured on the server',
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
      order = await this.createRazorpayOrderWithRetry({
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
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new InternalServerErrorException('Razorpay secret not configured');
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${dto.razorpay_order_id}|${dto.razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== dto.razorpay_signature) {
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
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      this.logger.warn('Webhook secret not configured');
      return { status: 'ignored' };
    }

    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
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

  private async createRazorpayOrderWithRetry(payload: any, attempt = 1): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');

    try {
      const response = await fetch(`https://api.razorpay.com/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        this.logger.error(`Gateway error: ${response.status}`, errorData);
        throw new InternalServerErrorException(`Payment gateway error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);

      const isNetworkError = error.name === 'AbortError' || error.name === 'TypeError' || error.name === 'FetchError' || error.code === 'ECONNRESET';
      
      if (isNetworkError) {
        if (attempt < 2) {
          this.logger.warn(`Network error during Razorpay order creation. Retrying... (attempt ${attempt + 1})`);
          return this.createRazorpayOrderWithRetry(payload, attempt + 1);
        }
        this.logger.error('Network error failed after retries', error);
        throw new InternalServerErrorException('Failed to communicate with payment gateway due to network error');
      }

      throw error;
    }
  }
}
