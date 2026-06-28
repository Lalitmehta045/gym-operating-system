import { TenantSubscriptionGuard } from './tenant-subscription.guard.js';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const makePrismaMock = () => ({
  tenant: {
    findUnique: jest.fn(),
  },
});

const makeContextMock = (metadata: any, user: any) => {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as ExecutionContext;
};

describe('TenantSubscriptionGuard', () => {
  let reflector: Reflector;
  let prisma: any;
  let guard: TenantSubscriptionGuard;

  beforeEach(() => {
    reflector = new Reflector();
    prisma = makePrismaMock();
    guard = new TenantSubscriptionGuard(reflector, prisma);
  });

  test('allows @Public() routes without checking tenant', async () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(true);
    const ctx = makeContextMock({}, { tenantId: 't1', role: 'OWNER' });

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  test('allows @SkipSubscriptionCheck() routes', async () => {
    reflector.getAllAndOverride = jest
      .fn()
      .mockImplementation((key: string) => {
        if (key === 'isPublic') return false;
        if (key === 'skipSubscription') return true;
        return undefined;
      });
    const ctx = makeContextMock({}, { tenantId: 't1', role: 'OWNER' });

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  test('allows SUPER_ADMIN users', async () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(false);
    const ctx = makeContextMock({}, { tenantId: null, role: 'SUPER_ADMIN' });

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  test('allows users without tenantId', async () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(false);
    const ctx = makeContextMock({}, { tenantId: null, role: 'OWNER' });

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  test('allows ACTIVE tenant', async () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(false);
    prisma.tenant.findUnique.mockResolvedValue({ status: 'ACTIVE' });
    const ctx = makeContextMock({}, { tenantId: 't1', role: 'OWNER' });

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  test('allows TRIAL tenant', async () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(false);
    prisma.tenant.findUnique.mockResolvedValue({ status: 'TRIAL' });
    const ctx = makeContextMock({}, { tenantId: 't1', role: 'OWNER' });

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  test('throws ForbiddenException for EXPIRED tenant', async () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(false);
    prisma.tenant.findUnique.mockResolvedValue({ status: 'EXPIRED' });
    const ctx = makeContextMock({}, { tenantId: 't1', role: 'OWNER' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(ctx)).rejects.toThrow(
      'Tenant subscription expired. Please renew.',
    );
  });
});
