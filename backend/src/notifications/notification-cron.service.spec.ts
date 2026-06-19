import { Test, TestingModule } from '@nestjs/testing';
import { NotificationCronService } from './notification-cron.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import { WhatsappService } from '../whatsapp/services/whatsapp.service.js';
import { RazorpayService } from '../razorpay/services/razorpay.service.js';
import { NotificationType } from './dto/notification-type.enum.js';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationCronService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        {
          provide: WhatsappService,
          useValue: { sendRenewalReminder: jest.fn().mockResolvedValue(true) },
        },
        { provide: RazorpayService, useValue: { createPaymentLink: jest.fn().mockResolvedValue('http://pay') } },
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
          membershipPlan: { name: 'Gold Plan' },
          member: {},
        },
      ]);
      mockPrismaService.notification.createMany.mockResolvedValue({ count: 1 });

      await service.generateExpirationNotifications();

      // Should be called 6 times (30, 15, 7, 3, 1, 0 days)
      expect(prisma.subscription.findMany).toHaveBeenCalledTimes(6);

      // createMany should be called 6 times (once for each day-check iteration that has records)
      expect(prisma.notification.createMany).toHaveBeenCalledTimes(6);

      // Check the last call (expired)
      expect(prisma.notification.createMany).toHaveBeenLastCalledWith({
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
    });
  });

  describe('generatePaymentDueNotifications', () => {
    it('should generate notifications for pending payments', async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([
        {
          id: 'pay-1',
          tenantId: 'tenant-1',
          memberId: 'member-1',
          amount: 50,
        },
      ]);
      mockPrismaService.notification.createMany.mockResolvedValue({ count: 1 });

      await service.generatePaymentDueNotifications();

      expect(prisma.payment.findMany).toHaveBeenCalledTimes(1);
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
