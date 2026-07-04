import { Test, TestingModule } from '@nestjs/testing';
import { TenantStorageService, STORAGE_LIMITS } from './tenant-storage.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { WhatsappService } from '../whatsapp/services/whatsapp.service.js';
import { BadRequestException } from '@nestjs/common';

describe('TenantStorageService', () => {
  let service: TenantStorageService;
  let prisma: PrismaService;
  let notifications: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantStorageService,
        {
          provide: PrismaService,
          useValue: {
            tenantSubscription: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
            },
            media: {
              findMany: jest.fn(),
              groupBy: jest.fn(),
            },
            tenantStorage: {
              upsert: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              aggregate: jest.fn(),
            },
            tenant: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
            user: {
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            createNotification: jest.fn(),
          },
        },
        {
          provide: WhatsappService,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TenantStorageService>(TenantStorageService);
    prisma = module.get<PrismaService>(PrismaService);
    notifications = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Storage calculation', () => {
    it('should correctly sum storage from media table and upsert TenantStorage', async () => {
      jest.spyOn(prisma.tenantSubscription, 'findFirst').mockResolvedValue({
        platformPlan: { name: 'Growth' },
      } as any);

      jest.spyOn(prisma.media, 'groupBy').mockResolvedValue([
        { type: 'IMAGE', _sum: { size: 500 }, _count: { _all: 1 } },
        { type: 'DOCUMENT', _sum: { size: 1000 }, _count: { _all: 1 } },
      ] as any);

      jest.spyOn(prisma.tenantStorage, 'upsert').mockResolvedValue({
        usedStorageBytes: 1500,
        storageLimitBytes: STORAGE_LIMITS.GROWTH,
      } as any);

      const result = await service.calculateTenantStorage('tenant_1');

      expect(prisma.media.groupBy).toHaveBeenCalledWith({
        by: ['type'],
        where: { tenantId: 'tenant_1', deletedAt: null },
        _sum: { size: true },
        _count: { _all: true },
      });

      expect(prisma.tenantStorage.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            usedStorageBytes: 1500,
            totalFiles: 2,
            totalImages: 1,
            totalDocuments: 1,
            storageLimitBytes: STORAGE_LIMITS.GROWTH,
          }),
        }),
      );
      
      expect(result.usedStorageBytes).toBe(1500);
    });
  });

  describe('Quota warning', () => {
    it('should send notification when storage exceeds 80%', async () => {
      jest.spyOn(prisma.tenantStorage, 'upsert').mockResolvedValue({
        usedStorageBytes: 85,
        storageLimitBytes: 100,
      } as any);

      jest.spyOn(prisma.tenant, 'findUnique').mockResolvedValue({ id: 'tenant_1' } as any);
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue({ id: 'user_1' } as any);
      
      // Override calculateTenantStorage inner mocks because it's called
      jest.spyOn(prisma.tenantSubscription, 'findFirst').mockResolvedValue({} as any);
      jest.spyOn(prisma.media, 'groupBy').mockResolvedValue([] as any);

      await service.calculateTenantStorage('tenant_1');

      expect(notifications.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Storage Quota Warning',
          message: expect.stringContaining('80% full'),
        })
      );
    });
  });

  describe('Quota exceeded validation', () => {
    it('should throw BadRequestException if upload exceeds quota', async () => {
      jest.spyOn(prisma.tenantStorage, 'findUnique').mockResolvedValue({
        usedStorageBytes: 90,
        storageLimitBytes: 100,
      } as any);

      await expect(service.validateUpload('tenant_1', 15)).rejects.toThrow(BadRequestException);
    });

    it('should pass if upload is within quota', async () => {
      jest.spyOn(prisma.tenantStorage, 'findUnique').mockResolvedValue({
        usedStorageBytes: 80,
        storageLimitBytes: 100,
      } as any);

      await expect(service.validateUpload('tenant_1', 10)).resolves.not.toThrow();
    });
  });

  describe('Cron recalculation', () => {
    it('should recalculate storage for all active tenants', async () => {
      jest.spyOn(prisma.tenant, 'findMany').mockResolvedValue([
        { id: 'tenant_1' },
        { id: 'tenant_2' },
      ] as any).mockResolvedValueOnce([
        { id: 'tenant_1' },
        { id: 'tenant_2' },
      ] as any);

      const calcSpy = jest.spyOn(service, 'calculateTenantStorage').mockResolvedValue(null as any);

      await service.recalculateAllTenants();

      expect(prisma.tenant.findMany).toHaveBeenCalledWith({
        where: { isActive: true, deletedAt: null },
        select: { id: true },
        orderBy: { id: 'asc' },
        take: 100,
      });
      expect(calcSpy).toHaveBeenCalledTimes(2);
      expect(calcSpy).toHaveBeenCalledWith('tenant_1');
      expect(calcSpy).toHaveBeenCalledWith('tenant_2');
    });
  });

  describe('Platform storage analytics', () => {
    it('should batch tenant subscriptions instead of querying per storage row', async () => {
      jest.spyOn(prisma.tenantStorage, 'findMany').mockResolvedValue([
        {
          tenantId: 'tenant_1',
          usedStorageBytes: 50,
          storageLimitBytes: 100,
          totalFiles: 2,
          tenant: { name: 'Gym One' },
        },
        {
          tenantId: 'tenant_2',
          usedStorageBytes: 25,
          storageLimitBytes: 100,
          totalFiles: 1,
          tenant: { name: 'Gym Two' },
        },
      ] as any);
      jest.spyOn(prisma.tenantStorage, 'count').mockResolvedValue(2);
      jest.spyOn(prisma.tenantStorage, 'aggregate').mockResolvedValue({
        _sum: {
          usedStorageBytes: 75,
          storageLimitBytes: 200,
          totalFiles: 3,
        },
      } as any);
      jest.spyOn(prisma.tenantSubscription, 'findMany').mockResolvedValue([
        {
          tenantId: 'tenant_1',
          platformPlan: { name: 'Growth' },
        },
        {
          tenantId: 'tenant_2',
          platformPlan: { name: 'Starter' },
        },
      ] as any);

      const result = await service.getPlatformStorage();

      expect(prisma.tenantStorage.findMany).toHaveBeenCalledWith({
        include: {
          tenant: {
            select: { name: true },
          },
        },
        orderBy: { usedStorageBytes: 'desc' },
        skip: 0,
        take: 50,
      });
      expect(prisma.tenantSubscription.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.tenantSubscription.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: { in: ['tenant_1', 'tenant_2'] },
          status: { in: ['ACTIVE', 'TRIAL'] },
        },
        include: { platformPlan: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result.totalUsed).toBe(75);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
      expect(result.tenants[0].planName).toBe('Growth');
    });
  });
});
