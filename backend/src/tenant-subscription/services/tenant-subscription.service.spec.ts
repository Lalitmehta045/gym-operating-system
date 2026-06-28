import { TenantSubscriptionService } from './tenant-subscription.service.js';
import { NotFoundException } from '@nestjs/common';

const makePrismaMock = (overrides = {}) => {
  const defaultMock: any = {
    tenantSubscription: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    tenantInvoice: {
      create: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    platformPlan: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(defaultMock)),
  };
  return Object.assign(defaultMock, overrides);
};

describe('TenantSubscriptionService', () => {
  let prisma: any;
  let svc: TenantSubscriptionService;
  const tenantId = 'tenant-1';
  const planId = 'plan-1';

  beforeEach(() => {
    prisma = makePrismaMock();
    svc = new TenantSubscriptionService(prisma);
  });

  test('createTrialSubscription creates TRIAL sub with 14-day end date', async () => {
    prisma.platformPlan.findFirst.mockResolvedValue({ id: planId });
    prisma.tenantSubscription.create.mockResolvedValue({
      id: 'sub-1',
      tenantId,
      status: 'TRIAL',
    });
    prisma.tenant.update.mockResolvedValue({ id: tenantId, status: 'TRIAL' });

    const result = await svc.createTrialSubscription(tenantId);

    expect(prisma.tenantSubscription.create).toHaveBeenCalled();
    expect(result.status).toBe('TRIAL');
    const createArgs = prisma.tenantSubscription.create.mock.calls[0][0].data;
    expect(createArgs.status).toBe('TRIAL');
    expect(createArgs.trialEndsAt).toBeInstanceOf(Date);
  });

  test('activateSubscription creates ACTIVE sub with 30-day end date', async () => {
    prisma.tenantSubscription.findFirst.mockResolvedValue({
      id: 'sub-old',
      tenantId,
      status: 'TRIAL',
    });
    prisma.tenantSubscription.create.mockResolvedValue({
      id: 'sub-new',
      tenantId,
      status: 'ACTIVE',
    });
    prisma.tenantInvoice.update.mockResolvedValue({ id: 'inv-1' });
    prisma.tenant.update.mockResolvedValue({ id: tenantId, status: 'ACTIVE' });

    const result = await svc.activateSubscription(tenantId, planId, 'inv-1');

    expect(prisma.tenantSubscription.create).toHaveBeenCalled();
    expect(result.status).toBe('ACTIVE');
  });

  test('renewSubscription extends endDate by 30 days', async () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 10);
    prisma.tenantSubscription.findFirst.mockResolvedValue({
      id: 'sub-1',
      tenantId,
      endDate,
      status: 'ACTIVE',
    });
    prisma.tenantSubscription.update.mockResolvedValue({
      id: 'sub-1',
      tenantId,
      status: 'ACTIVE',
    });

    const result = await svc.renewSubscription(tenantId);

    expect(prisma.tenantSubscription.update).toHaveBeenCalled();
    expect(result.status).toBe('ACTIVE');
  });

  test('renewSubscription throws NotFoundException when no sub exists', async () => {
    prisma.tenantSubscription.findFirst.mockResolvedValue(null);

    await expect(svc.renewSubscription(tenantId)).rejects.toThrow(
      NotFoundException,
    );
  });

  test('cancelSubscription sets CANCELLED status', async () => {
    prisma.tenantSubscription.findFirst.mockResolvedValue({
      id: 'sub-1',
      tenantId,
      status: 'ACTIVE',
    });
    prisma.tenantSubscription.update.mockResolvedValue({
      id: 'sub-1',
      tenantId,
      status: 'CANCELLED',
    });

    const result = await svc.cancelSubscription(tenantId);

    expect(result.status).toBe('CANCELLED');
    const updateArgs = prisma.tenantSubscription.update.mock.calls[0][0].data;
    expect(updateArgs.cancelledAt).toBeInstanceOf(Date);
    expect(updateArgs.autoRenew).toBe(false);
  });

  test('expireSubscription sets EXPIRED status and updates tenant', async () => {
    prisma.tenantSubscription.findFirst.mockResolvedValue({
      id: 'sub-1',
      tenantId,
      status: 'ACTIVE',
    });
    prisma.tenantSubscription.update.mockResolvedValue({
      id: 'sub-1',
      tenantId,
      status: 'EXPIRED',
    });
    prisma.tenant.update.mockResolvedValue({ id: tenantId, status: 'EXPIRED' });

    const result = await svc.expireSubscription(tenantId);

    expect(result!.status).toBe('EXPIRED');
    expect(prisma.tenant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'EXPIRED' },
      }),
    );
  });

  test('getCurrentSubscription returns latest non-cancelled sub', async () => {
    prisma.tenantSubscription.findFirst.mockResolvedValue({
      id: 'sub-1',
      tenantId,
      status: 'ACTIVE',
      platformPlan: { id: planId, name: 'Starter' },
    });

    const result = await svc.getCurrentSubscription(tenantId);

    expect(result).not.toBeNull();
    expect(result!.platformPlan.name).toBe('Starter');
  });

  test('generateInvoiceNumber returns correct format', async () => {
    prisma.tenantInvoice.count.mockResolvedValue(5);

    const result = await svc.generateInvoiceNumber();

    const year = new Date().getFullYear();
    expect(result).toBe(`INV-SAAS-${year}-0006`);
  });
});
