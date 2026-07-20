import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { randomUUID } from 'crypto';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto.js';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto.js';
import { RenewSubscriptionDto } from '../dto/renew-subscription.dto.js';
import { SubscriptionDto } from '../dto/subscription.dto.js';
import { ListSubscriptionsQueryDto } from '../dto/list-subscriptions-query.dto.js';
import { ExpiringSubscriptionsQueryDto } from '../dto/expiring-subscriptions-query.dto.js';
import { PaginatedSubscriptionsDto } from '../dto/paginated-subscriptions.dto.js';
import {
  SubscriptionStatus,
  PaymentStatus,
} from '../../../generated/prisma/client.js';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSubscription(
    tenantId: string,
    dto: CreateSubscriptionDto,
  ): Promise<SubscriptionDto> {
    // Parallelize independent DB queries
    const [member, plan, activeSub] = await Promise.all([
      this.prisma.member.findFirst({
        where: { id: dto.memberId, tenantId, deletedAt: null },
      }),
      this.prisma.membershipPlan.findFirst({
        where: { id: dto.membershipPlanId, tenantId, deletedAt: null },
      }),
      this.prisma.subscription.findFirst({
        where: {
          memberId: dto.memberId,
          tenantId,
          status: SubscriptionStatus.ACTIVE,
          deletedAt: null,
        },
      }),
    ]);

    if (!member) throw new NotFoundException('Member not found');
    if (!plan) throw new NotFoundException('Membership plan not found');
    if (activeSub) {
      throw new BadRequestException(
        'Member already has an active subscription',
      );
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}-${randomUUID().slice(-8).toUpperCase()}`;

    const subscription = await this.prisma.$transaction(async (tx) => {
      // Default to ACTIVE as subscription is a contract, not a payment status
      const sub = await tx.subscription.create({
        data: {
          tenantId,
          memberId: dto.memberId,
          membershipPlanId: dto.membershipPlanId,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          amount: dto.amount,
          status: dto.status || SubscriptionStatus.ACTIVE,
          autoRenew: dto.autoRenew || false,
          notes: dto.notes,
        },
      });

      let invoiceStatus: 'DUE' | 'PARTIALLY_PAID' | 'PAID' = 'DUE';
      // Guard: clamp paidAmount to not exceed the subscription amount
      const paidAmt = Math.min(dto.paidAmount ?? 0, dto.amount);
      if (dto.paymentMethod && paidAmt > 0) {
        if (paidAmt >= dto.amount) {
          invoiceStatus = 'PAID';
        } else {
          invoiceStatus = 'PARTIALLY_PAID';
        }
      }

      const invoice = await tx.invoice.create({
        data: {
          tenantId,
          memberId: dto.memberId,
          subscriptionId: sub.id,
          invoiceNumber,
          amount: dto.amount,
          status: invoiceStatus,
        },
      });

      if (dto.paymentMethod && paidAmt > 0) {
        await tx.payment.create({
          data: {
            tenantId,
            memberId: dto.memberId,
            subscriptionId: sub.id,
            invoiceId: invoice.id,
            amount: paidAmt,
            paymentMethod: dto.paymentMethod,
            paymentStatus: PaymentStatus.PAID,
            paidAt: new Date(),
            notes: 'Initial subscription payment',
          },
        });
      }

      return sub;
    });

    return this.mapToDto(subscription);
  }

  async getAllSubscriptions(
    tenantId: string,
    query: ListSubscriptionsQueryDto,
  ): Promise<PaginatedSubscriptionsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const whereClause: any = { 
      tenantId, 
      deletedAt: null 
    };

    if (query.memberId) {
      whereClause.memberId = query.memberId;
    }

    if (query.status) {
      whereClause.status = query.status;
    }

    if (query.membershipPlanId) {
      whereClause.membershipPlanId = query.membershipPlanId;
    }

    if (query.startDate) {
      whereClause.startDate = { gte: new Date(query.startDate) };
    }

    if (query.endDate) {
      whereClause.endDate = { ...(whereClause.endDate || {}), lte: new Date(query.endDate) };
    }

    if (query.renewalDate) {
      whereClause.endDate = { ...(whereClause.endDate || {}), gte: new Date(query.renewalDate), lte: new Date(query.renewalDate) }; // Approximate matching might be needed, but strictly it's equality on date. Let's just do equality if they pass a single date, or we can use a range if they pass from/to. Wait, renewal date IS end date. Let's assume renewalDate means it matches endDate exactly (or gte/lte if it's a date string). Let's use gte and lt for the day. 
      const startOfDay = new Date(query.renewalDate);
      startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date(query.renewalDate);
      endOfDay.setHours(23,59,59,999);
      whereClause.endDate = { ...(whereClause.endDate || {}), gte: startOfDay, lte: endOfDay };
    }

    if (query.billingStatus) {
      whereClause.invoices = {
        some: {
          status: query.billingStatus as any,
        }
      };
    }

    const [subscriptions, total] = await this.prisma.$transaction([
      this.prisma.subscription.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          member: {
            select: {
              id: true,
              memberCode: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          membershipPlan: {
            select: {
              id: true,
              name: true,
            },
          },
          id: true,
          tenantId: true,
          memberId: true,
          membershipPlanId: true,
          startDate: true,
          endDate: true,
          amount: true,
          status: true,
          autoRenew: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),
      this.prisma.subscription.count({ where: whereClause }),
    ]);

    return {
      data: subscriptions.map((sub) => this.mapToDto(sub)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async getSubscriptionById(
    tenantId: string,
    id: string,
  ): Promise<SubscriptionDto> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        member: {
          select: {
            id: true,
            memberCode: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        },
        membershipPlan: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
    if (!subscription) throw new NotFoundException('Subscription not found');
    return this.mapToDto(subscription);
  }

  async updateSubscription(
    tenantId: string,
    id: string,
    dto: UpdateSubscriptionDto,
  ): Promise<SubscriptionDto> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
    return this.mapToDto(updated);
  }

  async deleteSubscription(tenantId: string, id: string): Promise<void> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');

    await this.prisma.subscription.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getExpiringSubscriptions(
    tenantId: string,
    query: ExpiringSubscriptionsQueryDto,
  ): Promise<PaginatedSubscriptionsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const now = new Date();
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + query.days);

    const where = {
      tenantId,
      deletedAt: null,
      status: SubscriptionStatus.ACTIVE,
      endDate: {
        gte: now,
        lte: targetDate,
      },
    };

    const [subscriptions, total] = await this.prisma.$transaction([
      this.prisma.subscription.findMany({
        where,
        orderBy: { endDate: 'asc' },
        skip,
        take: limit,
        select: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          membershipPlan: {
            select: {
              id: true,
              name: true,
            },
          },
          id: true,
          tenantId: true,
          memberId: true,
          membershipPlanId: true,
          startDate: true,
          endDate: true,
          amount: true,
          status: true,
          autoRenew: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      data: subscriptions.map((sub) => this.mapToDto(sub)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async renewSubscription(
    tenantId: string,
    id: string,
    dto: RenewSubscriptionDto,
  ): Promise<SubscriptionDto> {
    const result = await this.prisma.$transaction(async (tx) => {
      // Lock the subscription row for update to prevent concurrent double-renewals
      await tx.$executeRaw`SELECT * FROM subscriptions WHERE id = ${id}::uuid FOR UPDATE`;

      const oldSubscription = await tx.subscription.findFirst({
        where: { id, tenantId, deletedAt: null },
        include: { membershipPlan: true },
      });
      if (!oldSubscription) throw new NotFoundException('Subscription not found');

      const planDuration = oldSubscription.membershipPlan.durationDays;
      // Use CURRENT plan price, not stale subscription amount
      const currentPlanPrice = Number(oldSubscription.membershipPlan.price);

      // Start date is the day after the old end date (for context, notes, etc.)
      const newStartDate = new Date(oldSubscription.endDate);
      newStartDate.setDate(newStartDate.getDate() + 1);

      const newEndDate = new Date(oldSubscription.endDate);
      newEndDate.setDate(newEndDate.getDate() + planDuration);

      // Update existing subscription
      const updatedSubscription = await tx.subscription.update({
        where: { id: oldSubscription.id },
        data: {
          endDate: newEndDate,
          status: SubscriptionStatus.ACTIVE,
          notes: dto.notes ? `${oldSubscription.notes ? oldSubscription.notes + '\n' : ''}${dto.notes}` : oldSubscription.notes,
        },
      });

      // Generate invoice number
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}-${randomUUID().slice(-8).toUpperCase()}`;

      // Create new Invoice for the renewal cycle
      const invoice = await tx.invoice.create({
        data: {
          tenantId,
          memberId: oldSubscription.memberId,
          subscriptionId: updatedSubscription.id,
          invoiceNumber,
          amount: currentPlanPrice,
          status: 'PAID', // Paid immediately below
        },
      });

      // Create Payment linked to the Invoice
      await tx.payment.create({
        data: {
          tenantId,
          memberId: oldSubscription.memberId,
          subscriptionId: updatedSubscription.id,
          invoiceId: invoice.id,
          amount: currentPlanPrice,
          paymentMethod: dto.paymentMethod,
          paymentStatus: PaymentStatus.PAID,
          paidAt: new Date(),
          notes: dto.notes,
        },
      });

      return updatedSubscription;
    });

    return this.mapToDto(result);
  }

  private mapToDto(sub: any): SubscriptionDto {
    return {
      id: sub.id,
      tenantId: sub.tenantId,
      memberId: sub.memberId,
      membershipPlanId: sub.membershipPlanId,
      startDate: sub.startDate,
      endDate: sub.endDate,
      amount: sub.amount ? Number(sub.amount) : 0,
      status: sub.status,
      autoRenew: sub.autoRenew,
      notes: sub.notes,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
      member: sub.member
        ? {
            id: sub.member.id,
            memberCode: sub.member.memberCode,
            firstName: sub.member.firstName,
            lastName: sub.member.lastName,
            email: sub.member.email,
            phone: sub.member.phone,
          }
        : undefined,
      membershipPlan: sub.membershipPlan
        ? {
            id: sub.membershipPlan.id,
            name: sub.membershipPlan.name,
          }
        : undefined,
    };
  }
}
