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
            },
            media: {
              findMany: jest.fn(),
            },
            tenantStorage: {
              upsert: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
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

      jest.spyOn(prisma.media, 'findMany').mockResolvedValue([
        { size: 500, type: 'IMAGE' },
        { size: 1000, type: 'DOCUMENT' },
      ] as any);

      jest.spyOn(prisma.tenantStorage, 'upsert').mockResolvedValue({
        usedStorageBytes: 1500,
        storageLimitBytes: STORAGE_LIMITS.GROWTH,
      } as any);

      const result = await service.calculateTenantStorage('tenant_1');

      expect(prisma.media.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant_1', deletedAt: null },
        select: { size: true, type: true },
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
      jest.spyOn(prisma.media, 'findMany').mockResolvedValue([] as any);

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
      ] as any);

      const calcSpy = jest.spyOn(service, 'calculateTenantStorage').mockResolvedValue(null as any);

      await service.recalculateAllTenants();

      expect(prisma.tenant.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        select: { id: true },
      });
      expect(calcSpy).toHaveBeenCalledTimes(2);
      expect(calcSpy).toHaveBeenCalledWith('tenant_1');
      expect(calcSpy).toHaveBeenCalledWith('tenant_2');
    });
  });
});
