import { RazorpayService } from './razorpay.service.js';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import crypto from 'crypto';

const makePrismaMock = (overrides = {}) => {
  const defaultMock: any = {
    platformPlan: {
      findUnique: jest.fn(),
    },
    tenantInvoice: {
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findFirst: jest.fn(),
    },
    tenantSubscription: {
      create: jest.fn(),
      update: jest.fn(),
    },
    tenant: {
      update: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(defaultMock)),
  };
  return Object.assign(defaultMock, overrides);
};

const makeTenantSubServiceMock = () => ({
  generateInvoiceNumber: jest.fn(),
  activateSubscription: jest.fn(),
});

const makeWhatsappServiceMock = () => ({
  sendPaymentSuccess: jest.fn(),
});

describe('RazorpayService SaaS Tenant Billing', () => {
  let prisma: any;
  let tenantSubService: any;
  let whatsappService: any;
  let auditService: any;
  let svc: RazorpayService;
  const tenantId = 'tenant-1';
  const planId = 'plan-1';

  beforeEach(() => {
    prisma = makePrismaMock();
    tenantSubService = makeTenantSubServiceMock();
    whatsappService = makeWhatsappServiceMock();
    auditService = { createLog: jest.fn() };
    svc = new RazorpayService(prisma, whatsappService, tenantSubService, auditService);
    // Mock razorpay instance
    (svc as any).razorpay = {
      orders: {
        create: jest.fn(),
      },
    };
    process.env.RAZORPAY_KEY_SECRET = 'test_secret';
    process.env.RAZORPAY_WEBHOOK_SECRET = 'webhook_secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.RAZORPAY_KEY_SECRET;
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
  });

  test('createTenantOrder throws when Razorpay not configured', async () => {
    (svc as any).razorpay = null;

    await expect(svc.createTenantOrder(tenantId, { planId })).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  test('createTenantOrder throws when plan not found', async () => {
    prisma.platformPlan.findUnique.mockResolvedValue(null);

    await expect(svc.createTenantOrder(tenantId, { planId })).rejects.toThrow(
      NotFoundException,
    );
  });

  test('createTenantOrder creates invoice and Razorpay order', async () => {
    prisma.platformPlan.findUnique.mockResolvedValue({
      id: planId,
      name: 'Starter',
      price: 999,
    });
    tenantSubService.generateInvoiceNumber.mockResolvedValue(
      'INV-SAAS-2026-0001',
    );
    prisma.tenantInvoice.create.mockResolvedValue({
      id: 'inv-1',
      invoiceNumber: 'INV-SAAS-2026-0001',
    });
    (svc as any).razorpay.orders.create.mockResolvedValue({
      id: 'order-1',
      amount: 99900,
      currency: 'INR',
    });
    prisma.tenantInvoice.update.mockResolvedValue({ id: 'inv-1' });

    const result = await svc.createTenantOrder(tenantId, { planId });

    expect(prisma.tenantInvoice.create).toHaveBeenCalled();
    expect((svc as any).razorpay.orders.create).toHaveBeenCalled();
    expect(result.orderId).toBe('order-1');
  });

  test('verifyTenantPayment throws on invalid signature', async () => {
    const dto = {
      razorpay_order_id: 'order-1',
      razorpay_payment_id: 'pay-1',
      razorpay_signature: 'invalid',
    };

    await expect(svc.verifyTenantPayment(tenantId, dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  test('verifyTenantPayment returns already processed when invoice is PAID', async () => {
    const dto = {
      razorpay_order_id: 'order-1',
      razorpay_payment_id: 'pay-1',
      razorpay_signature: 'valid-sig',
    };
    prisma.tenantInvoice.findFirst.mockResolvedValue({
      id: 'inv-1',
      status: 'PAID',
    });

    jest.spyOn(crypto, 'createHmac').mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('valid-sig'),
    } as any);

    const result = await svc.verifyTenantPayment(tenantId, dto);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Payment was already processed');
    jest.restoreAllMocks();
  });

  test('verifyTenantPayment processes payment and activates subscription', async () => {
    const dto = {
      razorpay_order_id: 'order-1',
      razorpay_payment_id: 'pay-1',
      razorpay_signature: 'valid-sig',
    };
    prisma.tenantInvoice.findFirst.mockResolvedValue({
      id: 'inv-1',
      status: 'PENDING',
      platformPlanId: planId,
    });
    prisma.tenantInvoice.updateMany.mockResolvedValue({ count: 1 });
    tenantSubService.activateSubscription.mockResolvedValue({ id: 'sub-1' });

    // Mock crypto HMAC to match signature
    jest.spyOn(crypto, 'createHmac').mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('valid-sig'),
    } as any);

    const result = await svc.verifyTenantPayment(tenantId, dto);

    expect(result.success).toBe(true);
    expect(prisma.tenantInvoice.updateMany).toHaveBeenCalled();
    expect(tenantSubService.activateSubscription).toHaveBeenCalledWith(
      tenantId,
      planId,
      'inv-1',
      prisma,
    );

    jest.restoreAllMocks();
  });

  test('handleTenantWebhook ignores when no secret configured', async () => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    const result = await svc.handleTenantWebhook('sig', Buffer.from(''), {});
    expect(result.status).toBe('ignored');
  });

  test('handleTenantWebhook throws on invalid signature', async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'secret';

    await expect(
      svc.handleTenantWebhook('bad-sig', Buffer.from('body'), {}),
    ).rejects.toThrow(BadRequestException);

    delete process.env.RAZORPAY_WEBHOOK_SECRET;
  });

  test('handleTenantWebhook returns ignored when no order_id', async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'secret';
    jest.spyOn(crypto, 'createHmac').mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('sig'),
    } as any);

    const result = await svc.handleTenantWebhook('sig', Buffer.from('body'), {
      event: 'payment.captured',
      payload: { payment: { entity: {} } },
    });

    expect(result.status).toBe('ignored');
    jest.restoreAllMocks();
  });

  test('handleTenantWebhook processes payment.captured event', async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'secret';
    jest.spyOn(crypto, 'createHmac').mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('sig'),
    } as any);

    prisma.tenantInvoice.findFirst.mockResolvedValue({
      id: 'inv-1',
      tenantId,
      status: 'PENDING',
      platformPlanId: planId,
    });
    prisma.tenantInvoice.updateMany.mockResolvedValue({ count: 1 });
    tenantSubService.activateSubscription.mockResolvedValue({ id: 'sub-1' });

    const result = await svc.handleTenantWebhook('sig', Buffer.from('body'), {
      event: 'payment.captured',
      payload: {
        payment: { entity: { id: 'pay-1', order_id: 'order-1' } },
      },
    });

    expect(result.status).toBe('ok');
    expect(tenantSubService.activateSubscription).toHaveBeenCalledWith(
      tenantId,
      planId,
      'inv-1',
      prisma,
    );
    jest.restoreAllMocks();
  });

  test('handleTenantWebhook returns already_processed for duplicate', async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'secret';
    jest.spyOn(crypto, 'createHmac').mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('sig'),
    } as any);

    prisma.tenantInvoice.findFirst.mockResolvedValue({
      id: 'inv-1',
      tenantId,
      status: 'PAID',
      platformPlanId: planId,
    });

    const result = await svc.handleTenantWebhook('sig', Buffer.from('body'), {
      event: 'payment.captured',
      payload: {
        payment: { entity: { id: 'pay-1', order_id: 'order-1' } },
      },
    });

    expect(result.status).toBe('already_processed');
    jest.restoreAllMocks();
  });
});
