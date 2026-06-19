// ============================================================================
// MembershipPlansService - Phase 2B membership plan business logic
// ============================================================================

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembershipPlan, Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  CreateMembershipPlanDto,
  PlanType,
} from '../dto/create-membership-plan.dto.js';
import { ListMembershipPlansQueryDto } from '../dto/list-membership-plans-query.dto.js';
import { MembershipPlanDto } from '../dto/membership-plan.dto.js';
import { PaginatedMembershipPlansDto } from '../dto/paginated-membership-plans.dto.js';
import { UpdateMembershipPlanDto } from '../dto/update-membership-plan.dto.js';
import { MembershipPlanServiceInterface } from '../interfaces/membership-plan-service.interface.js';

@Injectable()
export class MembershipPlansService implements MembershipPlanServiceInterface {
  constructor(private readonly prisma: PrismaService) {}

  async createPlan(
    tenantId: string,
    dto: CreateMembershipPlanDto,
  ): Promise<MembershipPlanDto> {
    this.assertTenantScope(tenantId);
    await this.assertTenantExists(tenantId);

    const plan = await this.prisma.membershipPlan.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        planType: dto.planType,
        durationDays: dto.durationDays,
        price: new Prisma.Decimal(dto.price),
        displayOrder: dto.displayOrder,
        isActive: dto.isActive,
      },
    });

    return this.toDto(plan);
  }

  async getPlanById(
    tenantId: string,
    planId: string,
  ): Promise<MembershipPlanDto> {
    this.assertTenantScope(tenantId);

    const plan = await this.prisma.membershipPlan.findFirst({
      where: {
        id: planId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!plan) {
      throw new NotFoundException('Membership plan not found');
    }

    return this.toDto(plan);
  }

  async listPlans(
    tenantId: string,
    query: ListMembershipPlansQueryDto = {},
  ): Promise<PaginatedMembershipPlansDto> {
    this.assertTenantScope(tenantId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.MembershipPlanWhereInput = {
      tenantId,
      ...(query.isActive !== undefined
        ? { isActive: query.isActive }
        : query.includeInactive
          ? {}
          : { isActive: true }),
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.planType && {
        planType: query.planType,
      }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [plans, total] = await this.prisma.$transaction([
      this.prisma.membershipPlan.findMany({
        where,
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'desc' },
          { id: 'asc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.membershipPlan.count({ where }),
    ]);

    return {
      data: plans.map((plan) => this.toDto(plan)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updatePlan(
    tenantId: string,
    planId: string,
    dto: UpdateMembershipPlanDto,
  ): Promise<MembershipPlanDto> {
    this.assertTenantScope(tenantId);

    const existingPlan = await this.prisma.membershipPlan.findFirst({
      where: {
        id: planId,
        tenantId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!existingPlan) {
      throw new NotFoundException('Membership plan not found');
    }

    const plan = await this.prisma.membershipPlan.update({
      where: { id: planId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.planType !== undefined && {
          planType: dto.planType,
        }),
        ...(dto.durationDays !== undefined && {
          durationDays: dto.durationDays,
        }),
        ...(dto.price !== undefined && {
          price: new Prisma.Decimal(dto.price),
        }),
        ...(dto.displayOrder !== undefined && {
          displayOrder: dto.displayOrder,
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    return this.toDto(plan);
  }

  async softDeletePlan(tenantId: string, planId: string): Promise<void> {
    this.assertTenantScope(tenantId);

    const existingPlan = await this.prisma.membershipPlan.findFirst({
      where: {
        id: planId,
        tenantId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!existingPlan) {
      throw new NotFoundException('Membership plan not found');
    }

    await this.prisma.membershipPlan.update({
      where: { id: planId },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  async restorePlan(
    tenantId: string,
    planId: string,
  ): Promise<MembershipPlanDto> {
    this.assertTenantScope(tenantId);

    const existingPlan = await this.prisma.membershipPlan.findFirst({
      where: {
        id: planId,
        tenantId,
      },
      select: { id: true },
    });

    if (!existingPlan) {
      throw new NotFoundException('Membership plan not found');
    }

    const plan = await this.prisma.membershipPlan.update({
      where: { id: planId },
      data: {
        deletedAt: null,
        isActive: true,
      },
    });

    return this.toDto(plan);
  }

  private assertTenantScope(
    tenantId: string | null | undefined,
  ): asserts tenantId is string {
    if (!tenantId) {
      throw new ForbiddenException('Tenant-scoped access is required');
    }
  }

  private async assertTenantExists(tenantId: string): Promise<void> {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        id: tenantId,
        deletedAt: null,
        isActive: true,
      },
      select: { id: true },
    });

    if (!tenant) {
      throw new ForbiddenException('Active tenant access is required');
    }
  }

  private toDto(plan: MembershipPlan): MembershipPlanDto {
    return {
      id: plan.id,
      tenantId: plan.tenantId,
      name: plan.name,
      description: plan.description,
      planType: plan.planType as PlanType,
      durationDays: plan.durationDays,
      price: plan.price.toFixed(2),
      displayOrder: plan.displayOrder,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      deletedAt: plan.deletedAt,
    };
  }
}
