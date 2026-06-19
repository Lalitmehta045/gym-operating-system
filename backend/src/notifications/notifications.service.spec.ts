import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationType } from './dto/notification-type.enum.js';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    it('should create a notification', async () => {
      const data = {
        tenantId: 'tenant-1',
        memberId: 'member-1',
        type: NotificationType.SYSTEM,
        title: 'Test',
        message: 'Message',
      };

      mockPrismaService.notification.create.mockResolvedValue({
        id: 'notif-1',
        ...data,
      });

      const result = await service.createNotification(data);
      expect(result.id).toEqual('notif-1');
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          ...data,
          metadata: null,
        },
      });
    });
  });

  describe('listNotifications', () => {
    it('should return paginated notifications', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([
        { id: 'notif-1' },
      ]);
      mockPrismaService.notification.count.mockResolvedValue(1);

      const result = await service.listNotifications('tenant-1', {
        page: 1,
        limit: 10,
      });
      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toEqual(1);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockPrismaService.notification.count.mockResolvedValue(5);
      const result = await service.getUnreadCount('tenant-1');
      expect(result.count).toEqual(5);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({
        count: 1,
      });
      mockPrismaService.notification.findFirst.mockResolvedValue({
        id: 'notif-1',
        tenantId: 'tenant-1',
        isRead: true,
      });

      const result = await service.markAsRead('tenant-1', 'notif-1');
      expect(result.isRead).toBe(true);
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 'notif-1', tenantId: 'tenant-1' },
        data: { isRead: true },
      });
    });

    it('should throw NotFoundException if notification does not exist or tenant mismatch', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({
        count: 0,
      });

      await expect(service.markAsRead('tenant-1', 'notif-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all as read for tenant', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead('tenant-1');
      expect(result.updatedCount).toEqual(3);
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', isRead: false },
        data: { isRead: true },
      });
    });
  });
});
