import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import {
  SubscriptionStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../../generated/prisma/client.js';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: PrismaService,
          useValue: {
            member: { findUnique: jest.fn(), findFirst: jest.fn() },
            membershipPlan: { findUnique: jest.fn(), findFirst: jest.fn() },
            subscription: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
            },
            invoice: { count: jest.fn(), create: jest.fn() },
            payment: { create: jest.fn() },
            $transaction: jest.fn((callback) => callback(prisma)),
          },
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSubscription', () => {
    it('should throw NotFoundException if member does not exist', async () => {
      (prisma.member.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createSubscription('tenant-1', {
          memberId: 'member-1',
          membershipPlanId: 'plan-1',
          startDate: '2026-06-01',
          endDate: '2026-07-01',
          amount: 100,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if active subscription exists', async () => {
      (prisma.member.findFirst as jest.Mock).mockResolvedValue({
        id: 'member-1',
      });
      (prisma.membershipPlan.findFirst as jest.Mock).mockResolvedValue({
        id: 'plan-1',
      });
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue({
        id: 'sub-1',
        status: SubscriptionStatus.ACTIVE,
      });

      await expect(
        service.createSubscription('tenant-1', {
          memberId: 'member-1',
          membershipPlanId: 'plan-1',
          startDate: '2026-06-01',
          endDate: '2026-07-01',
          amount: 100,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a subscription successfully', async () => {
      (prisma.member.findFirst as jest.Mock).mockResolvedValue({
        id: 'member-1',
      });
      (prisma.membershipPlan.findFirst as jest.Mock).mockResolvedValue({
        id: 'plan-1',
      });
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.subscription.create as jest.Mock).mockResolvedValue({
        id: 'sub-1',
        amount: 100,
        status: SubscriptionStatus.PENDING,
      });

      const result = await service.createSubscription('tenant-1', {
        memberId: 'member-1',
        membershipPlanId: 'plan-1',
        startDate: '2026-06-01',
        endDate: '2026-07-01',
        amount: 100,
      });

      expect(result).toHaveProperty('id', 'sub-1');
      expect(prisma.subscription.create).toHaveBeenCalled();
    });
  });

  describe('renewSubscription', () => {
    it('should throw NotFoundException if old subscription not found', async () => {
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.renewSubscription('tenant-1', 'sub-1', {
          paymentMethod: PaymentMethod.CASH,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should successfully renew a subscription and generate invoice/payment', async () => {
      const oldSub = {
        id: 'sub-1',
        memberId: 'member-1',
        membershipPlanId: 'plan-1',
        endDate: new Date('2026-06-01'),
        amount: 100,
        membershipPlan: { durationDays: 30 },
      };

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(oldSub);
      (prisma.subscription.create as jest.Mock).mockResolvedValue({
        id: 'sub-2',
        amount: 100,
      });
      (prisma.invoice.count as jest.Mock).mockResolvedValue(0);
      (prisma.payment.create as jest.Mock).mockResolvedValue({
        id: 'pay-1',
        amount: 100,
      });
      (prisma.invoice.create as jest.Mock).mockResolvedValue({ id: 'inv-1' });

      const result = await service.renewSubscription('tenant-1', 'sub-1', {
        paymentMethod: PaymentMethod.CASH,
      });

      expect(result).toHaveProperty('id', 'sub-2');
      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        data: { status: SubscriptionStatus.EXPIRED },
      });
      expect(prisma.payment.create).toHaveBeenCalled();
      expect(prisma.invoice.create).toHaveBeenCalled();
    });
  });
});
