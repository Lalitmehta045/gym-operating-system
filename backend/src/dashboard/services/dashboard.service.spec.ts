import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  MemberStatus,
  SubscriptionStatus,
  PaymentStatus,
  PaymentMethod,
  AttendanceStatus,
} from '../../../generated/prisma/client.js';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: PrismaService;

  const mockPrismaService = {
    member: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
      count: jest.fn(),
    },
    subscription: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
      count: jest.fn(),
    },
    attendance: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    payment: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    $transaction: jest.fn(async (arr: any[]) => Promise.all(arr)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOverview', () => {
    it('should return aggregated overview metrics for a tenant', async () => {
      mockPrismaService.member.groupBy.mockResolvedValue([
        { status: MemberStatus.ACTIVE, _count: { _all: 2 } },
        { status: MemberStatus.SUSPENDED, _count: { _all: 1 } },
        { status: MemberStatus.EXPIRED, _count: { _all: 1 } },
      ]);

      mockPrismaService.subscription.groupBy.mockResolvedValue([
        { status: SubscriptionStatus.ACTIVE, _count: { _all: 1 } },
        { status: SubscriptionStatus.EXPIRED, _count: { _all: 1 } },
      ]);

      mockPrismaService.attendance.count
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(10);

      mockPrismaService.payment.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 300 } })
        .mockResolvedValueOnce({ _sum: { amount: 300 } });

      mockPrismaService.subscription.count.mockResolvedValue(0);

      const result = await service.getOverview('tenant-id', {});

      expect(result.totalMembers).toBe(4);
      expect(result.activeMembers).toBe(2);
      expect(result.suspendedMembers).toBe(1);
      expect(result.inactiveMembers).toBe(1);

      expect(result.activeSubscriptions).toBe(1);
      expect(result.expiredSubscriptions).toBe(1);

      expect(result.todayAttendance).toBe(2);
      expect(result.totalRevenue).toBe(300);
      expect(result.monthlyRevenue).toBe(300);
    });
  });

  describe('getRevenueAnalytics', () => {
    it('should return revenue by method', async () => {
      mockPrismaService.payment.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 650 } })
        .mockResolvedValueOnce({ _sum: { amount: 650 } })
        .mockResolvedValueOnce({ _sum: { amount: 650 } });

      mockPrismaService.payment.groupBy.mockResolvedValue([
        { paymentMethod: PaymentMethod.CASH, _sum: { amount: 100 } },
        { paymentMethod: PaymentMethod.UPI, _sum: { amount: 500 } },
        { paymentMethod: PaymentMethod.CARD, _sum: { amount: 50 } },
      ]);

      const result = await service.getRevenueAnalytics('tenant-id', {});

      expect(result.totalRevenue).toBe(650);
      expect(result.revenueByMethod.CASH).toBe(100);
      expect(result.revenueByMethod.UPI).toBe(500);
      expect(result.revenueByMethod.CARD).toBe(50);
      expect(result.revenueByMethod.BANK_TRANSFER).toBe(0);
    });
  });

  describe('getAttendanceAnalytics', () => {
    it('should calculate attendance rates correctly', async () => {
      mockPrismaService.attendance.groupBy.mockResolvedValue([
        { status: AttendanceStatus.PRESENT, _count: { _all: 2 } },
        { status: AttendanceStatus.LATE, _count: { _all: 1 } },
        { status: AttendanceStatus.ABSENT, _count: { _all: 1 } },
        { status: AttendanceStatus.MISSED, _count: { _all: 1 } },
      ]);

      const result = await service.getAttendanceAnalytics('tenant-id', {});

      expect(result.todayPresent).toBe(2);
      expect(result.todayLate).toBe(1);
      expect(result.todayAbsent).toBe(1);
      expect(result.todayMissed).toBe(1);
      expect(result.attendanceRate).toBe(60);
    });
  });
});
