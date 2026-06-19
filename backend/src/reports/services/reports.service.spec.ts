import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  PaymentStatus,
  PaymentMethod,
  SubscriptionStatus,
} from '../../../generated/prisma/client.js';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: {
            payment: {
              aggregate: jest.fn(),
              groupBy: jest.fn(),
            },
            subscription: {
              groupBy: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should calculate revenue correctly', async () => {
    (prisma.payment.aggregate as jest.Mock).mockResolvedValue({
      _sum: { amount: 1000 },
    });
    (prisma.payment.groupBy as jest.Mock).mockResolvedValue([
      { paymentMethod: PaymentMethod.CASH, _sum: { amount: 100 } },
      { paymentMethod: PaymentMethod.UPI, _sum: { amount: 200 } },
      { paymentMethod: PaymentMethod.CARD, _sum: { amount: 300 } },
      { paymentMethod: PaymentMethod.BANK_TRANSFER, _sum: { amount: 400 } },
    ]);

    const result = await service.getRevenueReport('tenant-1');
    expect(result.totalRevenue).toBe(1000);
    expect(result.byMethod.CASH).toBe(100);
    expect(result.byMethod.UPI).toBe(200);
    expect(result.byMethod.CARD).toBe(300);
    expect(result.byMethod.BANK_TRANSFER).toBe(400);
  });

  it('should summarize subscriptions correctly', async () => {
    (prisma.subscription.groupBy as jest.Mock).mockResolvedValue([
      { status: SubscriptionStatus.ACTIVE, _count: 2 },
      { status: SubscriptionStatus.EXPIRED, _count: 1 },
      { status: SubscriptionStatus.CANCELLED, _count: 1 },
      { status: SubscriptionStatus.PENDING, _count: 1 },
    ]);

    const result = await service.getSubscriptionReport('tenant-1');
    expect(result.activeSubscriptions).toBe(2);
    expect(result.expiredSubscriptions).toBe(1);
    expect(result.cancelledSubscriptions).toBe(1);
    expect(result.pendingSubscriptions).toBe(1);
  });
});
