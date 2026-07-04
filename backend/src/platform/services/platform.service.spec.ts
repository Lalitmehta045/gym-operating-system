// ============================================================================
// PlatformService spec — Phase 9A Super Admin platform analytics
// ============================================================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PlatformService } from './platform.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TenantStatus } from '../../../generated/prisma/client.js';

describe('PlatformService', () => {
  let service: PlatformService;
  let prisma: PrismaService;

  const mockPrismaService = {
    tenant: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<PlatformService>(PlatformService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockCacheManager.get.mockResolvedValue(null);
  });

  describe('getPlatformDashboard', () => {
    it('should return aggregated dashboard metrics', async () => {
      mockPrismaService.$transaction.mockResolvedValue([10, 5, 3, 1, 1]);

      const result = await service.getPlatformDashboard();

      expect(result.totalGyms).toBe(10);
      expect(result.activeGyms).toBe(5);
      expect(result.trialGyms).toBe(3);
      expect(result.expiredGyms).toBe(1);
      expect(result.suspendedGyms).toBe(1);
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'nexupfit:platform:dashboard',
        result,
        60000,
      );
    });

    it('should return cached platform dashboard metrics', async () => {
      mockCacheManager.get.mockResolvedValueOnce({
        totalGyms: 1,
        activeGyms: 1,
        trialGyms: 0,
        expiredGyms: 0,
        suspendedGyms: 0,
      });

      const result = await service.getPlatformDashboard();

      expect(result.totalGyms).toBe(1);
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('getTenants', () => {
    it('should return paginated tenants with search filter', async () => {
      const tenants = [
        {
          id: 't1',
          name: 'Iron Forge Gym',
          email: 'demo@ironforge-gym.com',
          phone: '+91-9876543210',
          city: 'Noida',
          state: 'UP',
          country: 'India',
          status: TenantStatus.ACTIVE,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { users: 2, members: 50, subscriptions: 40 },
        },
      ];

      mockPrismaService.$transaction.mockResolvedValue([tenants, 1]);

      const result = await service.getTenants({
        page: 1,
        limit: 20,
        search: 'Iron',
      } as any);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Iron Forge Gym');
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPreviousPage).toBe(false);
    });

    it('should filter tenants by status', async () => {
      mockPrismaService.$transaction.mockResolvedValue([[], 0]);

      const result = await service.getTenants({
        page: 1,
        limit: 20,
        status: TenantStatus.TRIAL,
      } as any);

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('getTenantById', () => {
    it('should return tenant details with owner and counts', async () => {
      mockPrismaService.tenant.findFirst.mockResolvedValue({
        id: 't1',
        name: 'Iron Forge Gym',
        email: 'demo@ironforge-gym.com',
        phone: '+91-9876543210',
        address: '42 Fitness Lane',
        city: 'Noida',
        state: 'UP',
        country: 'India',
        gymLogoUrl: null,
        gymDescription: null,
        gymWebsite: null,
        gstNumber: null,
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        status: TenantStatus.ACTIVE,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [
          {
            id: 'u1',
            firstName: 'Rahul',
            lastName: 'Sharma',
            email: 'owner@ironforge-gym.com',
          },
        ],
        _count: {
          members: 50,
          subscriptions: 40,
          users: 2,
        },
      });

      const result = await service.getTenantById('t1');

      expect(result.id).toBe('t1');
      expect(result.name).toBe('Iron Forge Gym');
      expect(result.owner).not.toBeNull();
      expect(result.owner?.email).toBe('owner@ironforge-gym.com');
      expect(result.memberCount).toBe(50);
      expect(result.subscriptionCount).toBe(40);
      expect(result.userCount).toBe(2);
    });

    it('should throw NotFoundException when tenant does not exist', async () => {
      mockPrismaService.tenant.findFirst.mockResolvedValue(null);

      await expect(service.getTenantById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('suspendTenant', () => {
    it('should set tenant status to SUSPENDED', async () => {
      mockPrismaService.tenant.findFirst
        .mockResolvedValueOnce({ id: 't1', status: TenantStatus.ACTIVE })
        .mockResolvedValueOnce({
          id: 't1',
          name: 'Iron Forge Gym',
          email: 'demo@ironforge-gym.com',
          phone: null,
          address: null,
          city: null,
          state: null,
          country: null,
          gymLogoUrl: null,
          gymDescription: null,
          gymWebsite: null,
          gstNumber: null,
          timezone: 'Asia/Kolkata',
          currency: 'INR',
          status: TenantStatus.SUSPENDED,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          users: [],
          _count: { members: 0, subscriptions: 0, users: 0 },
        });

      mockPrismaService.tenant.update.mockResolvedValue({
        id: 't1',
        status: TenantStatus.SUSPENDED,
      });

      const result = await service.suspendTenant('t1');

      expect(mockPrismaService.tenant.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { status: TenantStatus.SUSPENDED },
      });
      expect(mockCacheManager.del).toHaveBeenCalledWith(
        'nexupfit:platform:dashboard',
      );
      expect(result.status).toBe(TenantStatus.SUSPENDED);
    });

    it('should throw NotFoundException when suspending non-existent tenant', async () => {
      mockPrismaService.tenant.findFirst.mockResolvedValue(null);

      await expect(service.suspendTenant('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('activateTenant', () => {
    it('should set tenant status to ACTIVE', async () => {
      mockPrismaService.tenant.findFirst
        .mockResolvedValueOnce({ id: 't1', status: TenantStatus.SUSPENDED })
        .mockResolvedValueOnce({
          id: 't1',
          name: 'Iron Forge Gym',
          email: 'demo@ironforge-gym.com',
          phone: null,
          address: null,
          city: null,
          state: null,
          country: null,
          gymLogoUrl: null,
          gymDescription: null,
          gymWebsite: null,
          gstNumber: null,
          timezone: 'Asia/Kolkata',
          currency: 'INR',
          status: TenantStatus.ACTIVE,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          users: [],
          _count: { members: 0, subscriptions: 0, users: 0 },
        });

      mockPrismaService.tenant.update.mockResolvedValue({
        id: 't1',
        status: TenantStatus.ACTIVE,
      });

      const result = await service.activateTenant('t1');

      expect(mockPrismaService.tenant.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { status: TenantStatus.ACTIVE },
      });
      expect(mockCacheManager.del).toHaveBeenCalledWith(
        'nexupfit:platform:dashboard',
      );
      expect(result.status).toBe(TenantStatus.ACTIVE);
    });

    it('should throw NotFoundException when activating non-existent tenant', async () => {
      mockPrismaService.tenant.findFirst.mockResolvedValue(null);

      await expect(service.activateTenant('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
