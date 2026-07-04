import { Test, TestingModule } from '@nestjs/testing';
import { NotificationCronService } from './notification-cron.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from './notifications.service.js';
import { NotificationType } from './dto/notification-type.enum.js';
import { NotificationQueueService } from './notification-queue.service.js';

describe('NotificationCronService', () => {
  let service: NotificationCronService;
  let prisma: PrismaService;
  let notificationsService: NotificationsService;

  const mockPrismaService = {
    subscription: {
      findMany: jest.fn(),
    },
    payment: {
      findMany: jest.fn(),
    },
    notification: {
      createMany: jest.fn(),
    },
  };

  const mockNotificationsService = {
    createNotification: jest.fn(),
  };

  const mockNotificationQueueService = {
    enqueueRenewalReminders: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationCronService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        {
          provide: NotificationQueueService,
          useValue: mockNotificationQueueService,
        },
      ],
    }).compile();

    service = module.get<NotificationCronService>(NotificationCronService);
    prisma = module.get<PrismaService>(PrismaService);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateExpirationNotifications', () => {
    it('should generate notifications for expiring and expired memberships', async () => {
      mockPrismaService.subscription.findMany.mockResolvedValue([
        {
          id: 'sub-1',
          tenantId: 'tenant-1',
          memberId: 'member-1',
          endDate: new Date(),
          amount: 100,
          deletedAt: null,
          membershipPlan: { name: 'Gold Plan' },
          member: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '919876543210',
            deletedAt: null,
          },
        },
      ]);
      mockPrismaService.notification.createMany.mockResolvedValue({ count: 1 });
      mockNotificationQueueService.enqueueRenewalReminders.mockResolvedValue(
        undefined,
      );

      await service.generateExpirationNotifications();

      expect(prisma.subscription.findMany).toHaveBeenCalledTimes(1);

      expect(prisma.notification.createMany).toHaveBeenCalledTimes(1);

      expect(prisma.notification.createMany).toHaveBeenCalledWith({
        data: [
          {
            tenantId: 'tenant-1',
            memberId: 'member-1',
            type: NotificationType.MEMBERSHIP_EXPIRED,
            title: 'Membership Expired',
            message: expect.stringContaining('expired today'),
            metadata: { subscriptionId: 'sub-1', daysRemaining: 0 },
          },
        ],
      });
      expect(
        mockNotificationQueueService.enqueueRenewalReminders,
      ).toHaveBeenCalledWith([
        expect.objectContaining({
          tenantId: 'tenant-1',
          subscriptionId: 'sub-1',
          memberId: 'member-1',
          daysRemaining: 0,
        }),
      ]);
    });
  });

  describe('generatePaymentDueNotifications', () => {
    it('should generate notifications for pending payments', async () => {
      mockPrismaService.payment.findMany
        .mockResolvedValueOnce([
          {
            id: 'pay-1',
            tenantId: 'tenant-1',
            memberId: 'member-1',
            amount: 50,
          },
        ])
        .mockResolvedValueOnce([]);
      mockPrismaService.notification.createMany.mockResolvedValue({ count: 1 });

      await service.generatePaymentDueNotifications();

      expect(prisma.payment.findMany).toHaveBeenCalledTimes(2);
      expect(prisma.notification.createMany).toHaveBeenCalledWith({
        data: [
          {
            tenantId: 'tenant-1',
            memberId: 'member-1',
            type: NotificationType.PAYMENT_DUE,
            title: 'Payment Due',
            message: expect.stringContaining('50'),
            metadata: { paymentId: 'pay-1', amount: 50 },
          },
        ],
      });
    });
  });
});
