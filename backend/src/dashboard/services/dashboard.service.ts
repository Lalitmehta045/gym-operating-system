import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service.js';
import { DashboardQueryDto } from '../dto/dashboard-query.dto.js';
import {
  DashboardOverviewDto,
  DashboardMembersDto,
  DashboardAttendanceDto,
  DashboardRevenueDto,
  DashboardSubscriptionsDto,
  DashboardTopMemberDto,
} from '../dto/responses.dto.js';
import {
  MemberStatus,
  AttendanceStatus,
  SubscriptionStatus,
  PaymentStatus,
  PaymentMethod,
  Prisma,
} from '../../../generated/prisma/client.js';

@Injectable()
export class DashboardService {
  private pendingDashboardQueries = new Map<string, Promise<DashboardOverviewDto>>();

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getOverview(
    tenantId: string,
    query: DashboardQueryDto,
  ): Promise<DashboardOverviewDto> {
    const { dateFrom, dateTo } = query;
    const cacheKey = `dashboard:overview:${tenantId}:${dateFrom || 'all'}:${dateTo || 'all'}`;

    const cached = await this.cacheManager.get<DashboardOverviewDto>(cacheKey);
    if (cached) return cached;

    if (this.pendingDashboardQueries.has(cacheKey)) {
      return this.pendingDashboardQueries.get(cacheKey)!;
    }

    const fetchPromise = (async () => {
      try {
    const dateFilter = this.getDateFilter(dateFrom, dateTo);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const [
      memberGroups,
      subGroups,
      todayAttendance,
      monthlyAttendances,
      totalRevenueAgg,
      monthlyRevenueAgg,
      expiringMemberships
    ] = await this.prisma.$transaction([
      this.prisma.member.groupBy({
        by: ['status'],
        where: { tenantId, deletedAt: null, ...dateFilter },
        _count: { _all: true },
        orderBy: { status: 'asc' },
      }),
      this.prisma.subscription.groupBy({
        by: ['status'],
        where: { tenantId, deletedAt: null, ...dateFilter },
        _count: { _all: true },
        orderBy: { status: 'asc' },
      }),
      this.prisma.attendance.count({
        where: {
          tenantId,
          deletedAt: null,
          attendanceDate: { gte: today, lt: tomorrow },
        },
      }),
      this.prisma.attendance.count({
        where: {
          tenantId,
          deletedAt: null,
          attendanceDate: { gte: startOfMonth },
        },
      }),
      this.prisma.payment.aggregate({
        where: {
          tenantId,
          deletedAt: null,
          paymentStatus: PaymentStatus.PAID,
          ...dateFilter,
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          tenantId,
          deletedAt: null,
          paymentStatus: PaymentStatus.PAID,
          paidAt: { gte: startOfMonth },
          ...dateFilter,
        },
        _sum: { amount: true },
      }),
      this.prisma.subscription.count({
        where: {
          tenantId,
          deletedAt: null,
          status: SubscriptionStatus.ACTIVE,
          endDate: { gte: today, lte: sevenDaysFromNow },
        },
      })
    ]);

    let totalMembers = 0;
    let activeMembers = 0;
    let inactiveMembers = 0;
    let suspendedMembers = 0;

    for (const group of memberGroups) {
      const count = Number((group._count as any)._all || 0);
      totalMembers += count;
      if (group.status === MemberStatus.ACTIVE) {
        activeMembers = count;
      } else if (group.status === MemberStatus.EXPIRED) {
        inactiveMembers = count;
      } else if (group.status === MemberStatus.SUSPENDED) {
        suspendedMembers = count;
      }
    }

    let activeSubscriptions = 0;
    let expiredSubscriptions = 0;

    for (const group of subGroups) {
      const count = Number((group._count as any)._all || 0);
      if (group.status === SubscriptionStatus.ACTIVE) {
        activeSubscriptions = count;
      } else if (group.status === SubscriptionStatus.EXPIRED) {
        expiredSubscriptions = count;
      }
    }

    const expectedAttendances = totalMembers * today.getDate(); // Rough estimate
    const monthlyAttendanceRate =
      expectedAttendances > 0
        ? (monthlyAttendances / expectedAttendances) * 100
        : 0;

    const totalRevenue = Number(totalRevenueAgg._sum?.amount || 0);
    const monthlyRevenue = Number(monthlyRevenueAgg._sum?.amount || 0);

    const result = {
      totalMembers,
      activeMembers,
      inactiveMembers,
      suspendedMembers,
      activeSubscriptions,
      expiredSubscriptions,
      todayAttendance,
      monthlyAttendanceRate: Math.round(monthlyAttendanceRate * 100) / 100,
      totalRevenue,
      monthlyRevenue,
      expiringMemberships,
    };

        await this.cacheManager.set(cacheKey, result, 60_000);
        this.pendingDashboardQueries.delete(cacheKey);

        return result;
      } catch (error) {
        this.pendingDashboardQueries.delete(cacheKey);
        throw error;
      }
    })();

    this.pendingDashboardQueries.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  async getMembersAnalytics(
    tenantId: string,
    query: DashboardQueryDto,
  ): Promise<DashboardMembersDto> {
    const { dateFrom, dateTo } = query;
    const dateFilter = this.getDateFilter(dateFrom, dateTo);

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [memberGroups, newMembersThisMonth] = await this.prisma.$transaction([
      this.prisma.member.groupBy({
        by: ['status'],
        where: { tenantId, deletedAt: null, ...dateFilter },
        _count: { _all: true },
        orderBy: { status: 'asc' },
      }),
      this.prisma.member.count({
        where: {
          tenantId,
          deletedAt: null,
          joinedAt: { gte: startOfMonth },
          ...dateFilter,
        },
      }),
    ]);

    let totalMembers = 0;
    let activeMembers = 0;
    let inactiveMembers = 0;
    let suspendedMembers = 0;

    for (const group of memberGroups) {
      const count = Number((group._count as any)._all || 0);
      totalMembers += count;
      if (group.status === MemberStatus.ACTIVE) {
        activeMembers = count;
      } else if (group.status === MemberStatus.EXPIRED) {
        inactiveMembers = count;
      } else if (group.status === MemberStatus.SUSPENDED) {
        suspendedMembers = count;
      }
    }

    return {
      totalMembers,
      newMembersThisMonth,
      activeMembers,
      inactiveMembers,
      suspendedMembers,
      dailyGrowth: [],
      weeklyGrowth: [],
      monthlyGrowth: [],
    };
  }

  async getAttendanceAnalytics(
    tenantId: string,
    query: DashboardQueryDto,
  ): Promise<DashboardAttendanceDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const [attGroups, todayAttendances, monthAttendances, lastMonthCount] = await Promise.all([
      this.prisma.attendance.groupBy({
        by: ['status'],
        where: {
          tenantId,
          deletedAt: null,
          attendanceDate: { gte: today, lt: tomorrow },
        },
        _count: { _all: true },
        orderBy: { status: 'asc' },
      }),
      this.prisma.attendance.findMany({
        where: {
          tenantId,
          deletedAt: null,
          attendanceDate: { gte: today, lt: tomorrow },
        },
        select: { checkInAt: true, checkOutAt: true }
      }),
      this.prisma.attendance.findMany({
        where: {
          tenantId,
          deletedAt: null,
          attendanceDate: { gte: startOfMonth, lt: startOfNextMonth },
        },
        include: {
          member: {
            include: {
              subscriptions: {
                where: { status: 'ACTIVE' },
                include: { membershipPlan: true }
              }
            }
          }
        }
      }),
      this.prisma.attendance.count({
        where: {
          tenantId,
          deletedAt: null,
          attendanceDate: { gte: startOfLastMonth, lt: startOfMonth },
        }
      })
    ]);

    let todayPresent = 0;
    let todayAbsent = 0;
    let todayLate = 0;
    let todayMissed = 0;
    let totalToday = 0;

    for (const group of attGroups) {
      const count = Number((group._count as any)._all || 0);
      totalToday += count;
      if (group.status === AttendanceStatus.PRESENT) {
        todayPresent = count;
      } else if (group.status === AttendanceStatus.ABSENT) {
        todayAbsent = count;
      } else if (group.status === AttendanceStatus.LATE) {
        todayLate = count;
      } else if (group.status === AttendanceStatus.MISSED) {
        todayMissed = count;
      }
    }

    const attendanceRate =
      totalToday > 0 ? ((todayPresent + todayLate) / totalToday) * 100 : 0;

    // Calculate hourly data (cumulative)
    const timeBuckets = [
      { label: '6 AM', hour: 6 },
      { label: '8 AM', hour: 8 },
      { label: '10 AM', hour: 10 },
      { label: '12 PM', hour: 12 },
      { label: '2 PM', hour: 14 },
      { label: '4 PM', hour: 16 },
      { label: '6 PM', hour: 18 },
      { label: '8 PM', hour: 20 },
      { label: '10 PM', hour: 22 },
    ];

    const hourlyData = timeBuckets.map(bucket => {
      const bucketTime = new Date(today);
      bucketTime.setHours(bucket.hour, 0, 0, 0);
      
      const checkIns = todayAttendances.filter(a => a.checkInAt <= bucketTime).length;
      const checkOuts = todayAttendances.filter(a => a.checkOutAt && a.checkOutAt <= bucketTime).length;
      
      return {
        time: bucket.label,
        checkIns,
        checkOuts
      };
    });

    // Calculate plan data
    const planCounts: Record<string, number> = {};
    for (const att of monthAttendances) {
      const planName = att.member.subscriptions[0]?.membershipPlan?.name || 'No Plan';
      planCounts[planName] = (planCounts[planName] || 0) + 1;
    }

    const colors = ['#6C47FF', '#3B82F6', '#F59E0B', '#22C55E', '#EC4899', '#8B5CF6'];
    const planData = Object.entries(planCounts).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    })).sort((a, b) => b.value - a.value);

    // Calculate growth
    const totalCheckInsThisMonth = monthAttendances.length;
    let growthPercentage = 0;
    if (lastMonthCount > 0) {
      growthPercentage = ((totalCheckInsThisMonth - lastMonthCount) / lastMonthCount) * 100;
    } else if (totalCheckInsThisMonth > 0) {
      growthPercentage = 100;
    }

    return {
      todayPresent,
      todayAbsent,
      todayLate,
      todayMissed,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      monthlyAttendanceTrend: [],
      hourlyData,
      planData,
      totalCheckInsThisMonth,
      growthPercentage: Math.round(growthPercentage * 10) / 10,
    };
  }

  async getRevenueAnalytics(
    tenantId: string,
    query: DashboardQueryDto,
  ): Promise<DashboardRevenueDto> {
    const { dateFrom, dateTo } = query;
    const dateFilter = this.getDateFilter(dateFrom, dateTo);

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [totalRevenueAgg, monthlyRevenueAgg, weeklyRevenueAgg, methodAggs] =
      await this.prisma.$transaction([
        this.prisma.payment.aggregate({
          where: {
            tenantId,
            deletedAt: null,
            paymentStatus: PaymentStatus.PAID,
            ...dateFilter,
          },
          _sum: { amount: true },
        }),
        this.prisma.payment.aggregate({
          where: {
            tenantId,
            deletedAt: null,
            paymentStatus: PaymentStatus.PAID,
            paidAt: { gte: startOfMonth },
            ...dateFilter,
          },
          _sum: { amount: true },
        }),
        this.prisma.payment.aggregate({
          where: {
            tenantId,
            deletedAt: null,
            paymentStatus: PaymentStatus.PAID,
            paidAt: { gte: startOfWeek },
            ...dateFilter,
          },
          _sum: { amount: true },
        }),
        this.prisma.payment.groupBy({
          by: ['paymentMethod'],
          where: {
            tenantId,
            deletedAt: null,
            paymentStatus: PaymentStatus.PAID,
            ...dateFilter,
          },
          _sum: { amount: true },
          orderBy: { paymentMethod: 'asc' },
        }),
      ]);

    const totalRevenue = Number(totalRevenueAgg._sum?.amount || 0);
    const monthlyRevenue = Number(monthlyRevenueAgg._sum?.amount || 0);
    const weeklyRevenue = Number(weeklyRevenueAgg._sum?.amount || 0);

    const revenueByMethod = {
      CASH: 0,
      UPI: 0,
      CARD: 0,
      BANK_TRANSFER: 0,
    };

    for (const agg of methodAggs) {
      const sum = Number(agg._sum?.amount || 0);
      if (agg.paymentMethod === PaymentMethod.CASH) {
        revenueByMethod.CASH = sum;
      } else if (agg.paymentMethod === PaymentMethod.UPI) {
        revenueByMethod.UPI = sum;
      } else if (agg.paymentMethod === PaymentMethod.CARD) {
        revenueByMethod.CARD = sum;
      } else if (agg.paymentMethod === PaymentMethod.BANK_TRANSFER) {
        revenueByMethod.BANK_TRANSFER = sum;
      }
    }

    return {
      totalRevenue,
      monthlyRevenue,
      weeklyRevenue,
      revenueByMethod,
    };
  }

  async getSubscriptionsAnalytics(
    tenantId: string,
    query: DashboardQueryDto,
  ): Promise<DashboardSubscriptionsDto> {
    const { dateFrom, dateTo } = query;
    const dateFilter = this.getDateFilter(dateFrom, dateTo);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getExpiringCount = (days: number) => {
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + days);
      return this.prisma.subscription.count({
        where: {
          tenantId,
          deletedAt: null,
          status: SubscriptionStatus.ACTIVE,
          endDate: { gte: today, lte: futureDate },
          ...dateFilter,
        },
      });
    };

    const [subGroups, expiring7, expiring15, expiring30] =
      await this.prisma.$transaction([
        this.prisma.subscription.groupBy({
          by: ['status'],
          where: { tenantId, deletedAt: null, ...dateFilter },
          _count: { _all: true },
          orderBy: { status: 'asc' },
        }),
        getExpiringCount(7),
        getExpiringCount(15),
        getExpiringCount(30),
      ]);

    let activeSubscriptions = 0;
    let expiredSubscriptions = 0;
    let cancelledSubscriptions = 0;
    let pendingSubscriptions = 0;

    for (const group of subGroups) {
      const count = Number((group._count as any)._all || 0);
      if (group.status === SubscriptionStatus.ACTIVE) {
        activeSubscriptions = count;
      } else if (group.status === SubscriptionStatus.EXPIRED) {
        expiredSubscriptions = count;
      } else if (group.status === SubscriptionStatus.CANCELLED) {
        cancelledSubscriptions = count;
      } else if (group.status === SubscriptionStatus.PENDING) {
        pendingSubscriptions = count;
      }
    }

    const renewalsThisMonth = 0;
    const expiringNext7Days = expiring7;
    const expiringNext15Days = expiring15;
    const expiringNext30Days = expiring30;

    return {
      activeSubscriptions,
      expiredSubscriptions,
      cancelledSubscriptions,
      pendingSubscriptions,
      renewalsThisMonth,
      expiringNext7Days,
      expiringNext15Days,
      expiringNext30Days,
    };
  }

  async getTopMembers(
    tenantId: string,
    query: DashboardQueryDto,
  ): Promise<DashboardTopMemberDto[]> {
    const { dateFrom, dateTo } = query;
    const cacheKey = `dashboard:top-members:${tenantId}:${dateFrom || 'all'}:${dateTo || 'all'}`;

    const cached = await this.cacheManager.get<DashboardTopMemberDto[]>(cacheKey);
    if (cached) return cached;

    const attendanceDateFilter = this.getAttendanceDateSqlFilter(
      dateFrom,
      dateTo,
    );

    const topMembers = await this.prisma.$queryRaw<any[]>`
      SELECT 
        m.id AS "memberId",
        CONCAT(m.first_name, ' ', m.last_name) AS "memberName",
        ROUND(
          (COUNT(CASE WHEN a.status IN ('PRESENT', 'LATE') THEN 1 END)::numeric / NULLIF(COUNT(a.id), 0)) * 100,
          2
        )::float AS "attendancePercentage"
      FROM members m
      JOIN attendances a ON m.id = a.member_id AND m.tenant_id = a.tenant_id
      WHERE m.tenant_id = ${tenantId}::uuid
        AND m.deleted_at IS NULL
        AND a.deleted_at IS NULL
        ${attendanceDateFilter}
      GROUP BY m.id, m.first_name, m.last_name
      ORDER BY "attendancePercentage" DESC
      LIMIT 10
    `;

    await this.cacheManager.set(cacheKey, topMembers, 300_000);
    return topMembers;
  }

  private getAttendanceDateSqlFilter(
    dateFrom?: string,
    dateTo?: string,
  ): Prisma.Sql {
    if (dateFrom && dateTo) {
      return Prisma.sql`AND a.attendance_date BETWEEN ${new Date(dateFrom)}::date AND ${new Date(dateTo)}::date`;
    }
    if (dateFrom) {
      return Prisma.sql`AND a.attendance_date >= ${new Date(dateFrom)}::date`;
    }
    if (dateTo) {
      return Prisma.sql`AND a.attendance_date <= ${new Date(dateTo)}::date`;
    }
    return Prisma.empty;
  }

  private getDateFilter(
    dateFrom?: string,
    dateTo?: string,
  ): { createdAt?: { gte?: Date; lte?: Date } } {
    if (!dateFrom && !dateTo) return {};

    const filter: { gte?: Date; lte?: Date } = {};
    if (dateFrom) {
      filter.gte = new Date(dateFrom);
    }
    if (dateTo) {
      filter.lte = new Date(dateTo);
    }
    return { createdAt: filter };
  }
}
