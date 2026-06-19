import { Test, TestingModule } from '@nestjs/testing';
import { RazorpayService } from './razorpay.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { WhatsappService } from '../../whatsapp/services/whatsapp.service.js';
import { TenantSubscriptionService } from '../../tenant-subscription/services/tenant-subscription.service.js';
import { BadRequestException } from '@nestjs/common';
import {
  PaymentStatus,
  SubscriptionStatus,
} from '../../../generated/prisma/client.js';
import crypto from 'crypto';

describe('RazorpayService', () => {
  let service: RazorpayService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RazorpayService,
        {
          provide: PrismaService,
          useValue: {
            payment: {
              findFirst: jest.fn(),
              updateMany: jest.fn(),
            },
            subscription: {
              update: jest.fn(),
            },
            invoice: {
              create: jest.fn(),
            },
            notification: {
              create: jest.fn(),
            },
            $transaction: jest.fn(async (cb) => {
              return cb(prisma);
            }),
          },
        },
        {
          provide: WhatsappService,
          useValue: {
            sendPaymentSuccess: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: TenantSubscriptionService,
          useValue: {
            generateInvoiceNumber: jest.fn().mockResolvedValue('INV-SAAS-2026-0001'),
            activateSubscription: jest.fn().mockResolvedValue({ id: 'sub-1' }),
          },
        },
      ],
    }).compile();

    service = module.get<RazorpayService>(RazorpayService);
    prisma = module.get<PrismaService>(PrismaService);

    process.env.RAZORPAY_KEY_SECRET = 'test_secret';
    process.env.RAZORPAY_WEBHOOK_SECRET = 'webhook_secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('A. Concurrent verifyPayment calls', () => {
    it('should process only one payment and return success for both, but generate one invoice', async () => {
      const paymentMock = {
        id: 'pay_123',
        tenantId: 'tenant_1',
        paymentStatus: PaymentStatus.PENDING,
        amount: 1000,
        memberId: 'member_1',
        subscriptionId: 'sub_1',
      };

      jest
        .spyOn(prisma.payment, 'findFirst')
        .mockResolvedValue(paymentMock as any);

      const signature = crypto
        .createHmac('sha256', 'test_secret')
        .update('order_123|razor_pay_123')
        .digest('hex');

      const dto = {
        razorpay_order_id: 'order_123',
        razorpay_payment_id: 'razor_pay_123',
        razorpay_signature: signature,
      };

      // First call succeeds updateMany, second fails
      jest
        .spyOn(prisma.payment, 'updateMany')
        .mockResolvedValueOnce({ count: 1 })
        .mockResolvedValueOnce({ count: 0 });

      const [res1, res2] = await Promise.all([
        service.verifyPayment('tenant_1', dto),
        service.verifyPayment('tenant_1', dto),
      ]);

      expect(res1.success).toBe(true);
      expect(res2.success).toBe(true);
      expect(res2.message).toBe('Payment was already processed');

      expect(prisma.payment.updateMany).toHaveBeenCalledTimes(2);
      expect(prisma.invoice.create).toHaveBeenCalledTimes(1); // Only generated once
      expect(prisma.notification.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('B. Duplicate webhook delivery', () => {
    it('should process first webhook and skip already processed duplicate', async () => {
      const paymentMock = {
        id: 'pay_123',
        tenantId: 'tenant_1',
        paymentStatus: PaymentStatus.PENDING,
        amount: 1000,
        memberId: 'member_1',
        subscriptionId: 'sub_1',
      };

      jest
        .spyOn(prisma.payment, 'findFirst')
        .mockResolvedValue(paymentMock as any);

      // First webhook call updateMany succeeds, second one count=0
      jest
        .spyOn(prisma.payment, 'updateMany')
        .mockResolvedValueOnce({ count: 1 })
        .mockResolvedValueOnce({ count: 0 });

      const payload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'razor_pay_123',
              order_id: 'order_123',
            },
          },
        },
      };

      const rawBody = Buffer.from(JSON.stringify(payload));
      const signature = crypto
        .createHmac('sha256', 'webhook_secret')
        .update(rawBody)
        .digest('hex');

      const res1 = await service.handleWebhook(signature, rawBody, payload);
      const res2 = await service.handleWebhook(signature, rawBody, payload);

      expect(res1.status).toBe('ok');
      expect(res2.status).toBe('already_processed');

      expect(prisma.payment.updateMany).toHaveBeenCalledTimes(2);
      expect(prisma.invoice.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('C. Webhook signature validation', () => {
    const payload = {
      event: 'payment.captured',
      payload: {
        payment: { entity: { id: 'razor_pay_123', order_id: 'order_123' } },
      },
    };
    const rawBody = Buffer.from(JSON.stringify(payload));

    it('should accept valid signature', async () => {
      const signature = crypto
        .createHmac('sha256', 'webhook_secret')
        .update(rawBody)
        .digest('hex');

      jest.spyOn(prisma.payment, 'findFirst').mockResolvedValue({
        id: 'pay_123',
        paymentStatus: PaymentStatus.PENDING,
      } as any);
      jest.spyOn(prisma.payment, 'updateMany').mockResolvedValue({ count: 1 });

      const res = await service.handleWebhook(signature, rawBody, payload);
      expect(res.status).toBe('ok');
    });

    it('should reject invalid signature', async () => {
      const invalidSignature = 'invalid_hash_abc123';

      await expect(
        service.handleWebhook(invalidSignature, rawBody, payload),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.handleWebhook(invalidSignature, rawBody, payload),
      ).rejects.toThrow('Invalid webhook signature');
    });

    it('should throw if rawBody is missing', async () => {
      await expect(
        service.handleWebhook('signature', null as any, payload),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.handleWebhook('signature', null as any, payload),
      ).rejects.toThrow('Missing raw body');
    });
  });
});
