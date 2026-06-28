// ============================================================================
// PlatformService — Phase 9A Super Admin platform analytics
// ============================================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  ListTenantsQueryDto,
  PlatformDashboardDto,
  PaginatedTenantsDto,
  TenantDetailDto,
  TenantListItemDto,
  PaginationMeta,
  RevenueMetricsDto,
} from '../dto/platform.dto.js';
import { TenantStatus } from '../../../generated/prisma/client.js';

@Injectable()
export class PlatformService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformDashboard(): Promise<PlatformDashboardDto> {
    const [totalGyms, activeGyms, trialGyms, expiredGyms, suspendedGyms] =
      await this.prisma.$transaction([
        this.prisma.tenant.count({ where: { deletedAt: null } }),
        this.prisma.tenant.count({
          where: { deletedAt: null, status: TenantStatus.ACTIVE },
        }),
        this.prisma.tenant.count({
          where: { deletedAt: null, status: TenantStatus.TRIAL },
        }),
        this.prisma.tenant.count({
          where: { deletedAt: null, status: TenantStatus.EXPIRED },
        }),
        this.prisma.tenant.count({
          where: { deletedAt: null, status: TenantStatus.SUSPENDED },
        }),
      ]);

    return {
      totalGyms,
      activeGyms,
      trialGyms,
      expiredGyms,
      suspendedGyms,
    };
  }

  async getTenants(query: ListTenantsQueryDto): Promise<PaginatedTenantsDto> {
    const { page = 1, limit = 20, status, search, sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tenants, total] = await this.prisma.$transaction([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder },
        include: {
          _count: {
            select: {
              users: true,
              members: true,
              subscriptions: true,
            },
          },
        },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    const data: TenantListItemDto[] = tenants.map((t) => ({
      id: t.id,
      name: t.name,
      email: t.email,
      phone: t.phone,
      city: t.city,
      state: t.state,
      country: t.country,
      status: t.status,
      isActive: t.isActive,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      _count: t._count,
    }));

    const totalPages = Math.ceil(total / limit);
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return { data, meta };
  }

  async getTenantById(tenantId: string): Promise<TenantDetailDto> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deletedAt: null },
      include: {
        users: {
          where: { role: 'OWNER', deletedAt: null },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
          take: 1,
        },
        _count: {
          select: {
            members: true,
            subscriptions: true,
            users: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${tenantId} not found`);
    }

    const owner = tenant.users[0] ?? null;

    return {
      id: tenant.id,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      address: tenant.address,
      city: tenant.city,
      state: tenant.state,
      country: tenant.country,
      gymLogoUrl: tenant.gymLogoUrl,
      gymDescription: tenant.gymDescription,
      gymWebsite: tenant.gymWebsite,
      gstNumber: tenant.gstNumber,
      timezone: tenant.timezone,
      currency: tenant.currency,
      status: tenant.status,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      owner: owner
        ? {
            id: owner.id,
            firstName: owner.firstName,
            lastName: owner.lastName,
            email: owner.email,
          }
        : null,
      memberCount: tenant._count.members,
      subscriptionCount: tenant._count.subscriptions,
      userCount: tenant._count.users,
    };
  }

  async suspendTenant(tenantId: string): Promise<TenantDetailDto> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deletedAt: null },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${tenantId} not found`);
    }

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { status: TenantStatus.SUSPENDED },
    });

    return this.getTenantById(tenantId);
  }

  async activateTenant(tenantId: string): Promise<TenantDetailDto> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deletedAt: null },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${tenantId} not found`);
    }

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { status: TenantStatus.ACTIVE },
    });

    return this.getTenantById(tenantId);
  }

  async getRevenueMetrics(): Promise<RevenueMetricsDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const activeSubs = await this.prisma.tenantSubscription.findMany({
      where: {
        status: 'ACTIVE',
        tenant: { isActive: true, deletedAt: null },
      },
      select: {
        platformPlan: {
          select: { price: true },
        },
      },
    });

    const mrr = activeSubs.reduce((sum, sub) => {
      return sum + Number(sub.platformPlan.price);
    }, 0);

    const revenueThisMonthAgg = await this.prisma.tenantInvoice.aggregate({
      _sum: { amount: true },
      where: {
        status: 'PAID',
        paidAt: { gte: startOfMonth, lt: endOfMonth },
      },
    });

    const revenueThisMonth = Number(revenueThisMonthAgg._sum.amount ?? 0);

    const revenueByPlanRaw = await this.prisma.tenantInvoice.groupBy({
      by: ['platformPlanId'],
      where: { status: 'PAID' },
      _sum: { amount: true },
    });

    const planIds = revenueByPlanRaw
      .map((r) => r.platformPlanId)
      .filter(Boolean) as string[];
    const plans = await this.prisma.platformPlan.findMany({
      where: { id: { in: planIds } },
      select: { id: true, name: true },
    });

    const revenueByPlan = revenueByPlanRaw.map((r) => {
      const plan = plans.find((p) => p.id === r.platformPlanId);
      return {
        planName: plan?.name ?? 'Unknown',
        revenue: Number(r._sum.amount ?? 0),
      };
    });

    return {
      mrr,
      arr: mrr * 12,
      revenueThisMonth,
      revenueByPlan,
    };
  }
}
