import { BillingService } from './billing.service';
import { NotFoundException } from '@nestjs/common';

const makePrismaMock = (overrides = {}) => {
  const defaultMock: any = {
    platformPlan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    tenantInvoice: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(async (cb: any) => {
      if (Array.isArray(cb)) {
        return Promise.all(cb.map((fn: any) => (typeof fn === 'function' ? fn(defaultMock) : fn)));
      }
      return cb(defaultMock);
    }),
  };
  return Object.assign(defaultMock, overrides);
};

const makeTenantSubscriptionServiceMock = () => ({
  getCurrentSubscription: jest.fn(),
  cancelSubscription: jest.fn(),
});

const makeRazorpayServiceMock = () => ({
  createTenantOrder: jest.fn(),
  verifyTenantPayment: jest.fn(),
});

describe('BillingService', () => {
  let prisma: any;
  let tenantSubService: any;
  let razorpayService: any;
  let svc: BillingService;
  const tenantId = 'tenant-1';

  beforeEach(() => {
    prisma = makePrismaMock();
    tenantSubService = makeTenantSubscriptionServiceMock();
    razorpayService = makeRazorpayServiceMock();
    svc = new BillingService(prisma, tenantSubService, razorpayService);
  });

  test('getCurrent returns subscription with daysRemaining', async () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 5);
    tenantSubService.getCurrentSubscription.mockResolvedValue({
      id: 'sub-1',
      tenantId,
      status: 'ACTIVE',
      endDate,
      platformPlan: { id: 'plan-1', name: 'Starter' },
    });

    const result = await svc.getCurrent(tenantId);

    expect(result.subscription).not.toBeNull();
    expect(result.daysRemaining).toBe(5);
    expect(result.isTrial).toBe(false);
  });

  test('getCurrent returns null when no subscription', async () => {
    tenantSubService.getCurrentSubscription.mockResolvedValue(null);

    const result = await svc.getCurrent(tenantId);

    expect(result.subscription).toBeNull();
    expect(result.daysRemaining).toBe(0);
  });

  test('getPlans returns active platform plans', async () => {
    prisma.platformPlan.findMany.mockResolvedValue([
      { id: 'plan-1', name: 'Starter' },
      { id: 'plan-2', name: 'Growth' },
    ]);

    const result = await svc.getPlans();

    expect(result).toHaveLength(2);
    expect(prisma.platformPlan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true } }),
    );
  });

  test('getInvoices returns paginated invoices', async () => {
    prisma.tenantInvoice.findMany.mockResolvedValue([{ id: 'inv-1' }]);
    prisma.tenantInvoice.count.mockResolvedValue(1);

    const result = await svc.getInvoices(tenantId, { page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  test('upgrade calls razorpayService.createTenantOrder', async () => {
    prisma.platformPlan.findUnique.mockResolvedValue({ id: 'plan-1', name: 'Growth' });
    razorpayService.createTenantOrder.mockResolvedValue({ orderId: 'order-1' });

    const result = await svc.upgrade(tenantId, { planId: 'plan-1' });

    expect(razorpayService.createTenantOrder).toHaveBeenCalledWith(tenantId, {
      planId: 'plan-1',
    });
    expect(result.orderId).toBe('order-1');
  });

  test('upgrade throws NotFoundException when plan not found', async () => {
    prisma.platformPlan.findUnique.mockResolvedValue(null);

    await expect(svc.upgrade(tenantId, { planId: 'plan-1' })).rejects.toThrow(
      NotFoundException,
    );
  });

  test('renew calls razorpayService.createTenantOrder with current plan', async () => {
    tenantSubService.getCurrentSubscription.mockResolvedValue({
      id: 'sub-1',
      platformPlanId: 'plan-1',
    });
    razorpayService.createTenantOrder.mockResolvedValue({ orderId: 'order-1' });

    const result = await svc.renew(tenantId);

    expect(razorpayService.createTenantOrder).toHaveBeenCalledWith(tenantId, {
      planId: 'plan-1',
    });
  });

  test('renew throws NotFoundException when no current subscription', async () => {
    tenantSubService.getCurrentSubscription.mockResolvedValue(null);

    await expect(svc.renew(tenantId)).rejects.toThrow(NotFoundException);
  });

  test('cancel delegates to tenantSubscriptionService', async () => {
    tenantSubService.cancelSubscription.mockResolvedValue({ id: 'sub-1' });

    const result = await svc.cancel(tenantId);

    expect(tenantSubService.cancelSubscription).toHaveBeenCalledWith(tenantId);
    expect(result.id).toBe('sub-1');
  });

  test('verifyPayment delegates to razorpayService', async () => {
    razorpayService.verifyTenantPayment.mockResolvedValue({ success: true });
    const dto = {
      razorpay_order_id: 'order-1',
      razorpay_payment_id: 'pay-1',
      razorpay_signature: 'sig-1',
    };

    const result = await svc.verifyPayment(tenantId, dto);

    expect(razorpayService.verifyTenantPayment).toHaveBeenCalledWith(tenantId, dto);
    expect(result.success).toBe(true);
  });
});
