import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  PaymentStatus,
  PaymentMethod,
  SubscriptionStatus,
} from '../../../generated/prisma/client.js';
import { ExpiringMembersQueryDto } from '../dto/expiring-members-query.dto.js';
import { FinancialMetricsService } from '../../financials/services/financial-metrics.service.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PDFDocument = require('pdfkit');

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly financialMetrics: FinancialMetricsService,
  ) {}

  async getDashboardAnalytics(tenantId: string) {
    const revenue = await this.financialMetrics.calculateTotalRevenue(tenantId);
    const collection = await this.financialMetrics.calculateOutstanding(tenantId);
    const invoiceCounts = await this.financialMetrics.getInvoiceCounts(tenantId);
    
    const members = await this.prisma.member.groupBy({
      by: ['status'],
      where: { tenantId, deletedAt: null },
      _count: true,
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendances = await this.prisma.attendance.count({
      where: { tenantId, checkInAt: { gte: today }, deletedAt: null }
    });

    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);
    
    const upcomingRenewals = await this.prisma.subscription.count({
      where: { tenantId, endDate: { gte: today, lte: nextMonth }, deletedAt: null, status: 'ACTIVE' }
    });

    const plans = await this.prisma.subscription.groupBy({
      by: ['membershipPlanId'],
      where: { tenantId, deletedAt: null },
      _count: true,
    });
    
    const staff = await this.prisma.member.groupBy({
      by: ['assignedTrainerId'],
      where: { tenantId, deletedAt: null, assignedTrainerId: { not: null } },
      _count: true,
    });

    // Get detailed plan names
    const planDetails = await Promise.all(plans.map(async p => {
      const plan = await this.prisma.membershipPlan.findUnique({ where: { id: p.membershipPlanId } });
      return { planName: plan?.name || 'Unknown', count: p._count };
    }));

    return {
      financials: { revenue, collection, invoiceCounts },
      memberships: members,
      attendance: { today: attendances },
      renewals: { upcoming: upcomingRenewals },
      plans: planDetails,
      staff,
    };
  }

  async generatePdfReport(tenantId: string, type: string, res: any) {
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${type}.pdf`);
    
    doc.pipe(res);
    
    doc.fontSize(20).text(`GymOS Analytics - ${type.toUpperCase()} Report`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);
    
    if (type === 'revenue' || type === 'dashboard') {
      const data = await this.getRevenueReport(tenantId);
      const dash = await this.getDashboardAnalytics(tenantId);

      doc.fontSize(16).text('Financial Summary');
      doc.moveDown();
      doc.fontSize(12).text(`Total Revenue: INR ${dash.financials.revenue}`);
      doc.text(`Total Outstanding: INR ${dash.financials.collection}`);
      doc.text(`Total Invoices: ${dash.financials.invoiceCounts.totalInvoices}`);
      doc.text(`Paid Invoices: ${dash.financials.invoiceCounts.paidInvoices}`);
      doc.text(`Pending Invoices: ${dash.financials.invoiceCounts.pendingInvoices}`);
      
      doc.moveDown(2);
      doc.fontSize(16).text('Revenue by Payment Method');
      doc.moveDown();
      doc.fontSize(12).text(`CASH: INR ${data.byMethod.CASH}`);
      doc.text(`UPI: INR ${data.byMethod.UPI}`);
      doc.text(`CARD: INR ${data.byMethod.CARD}`);
      doc.text(`BANK: INR ${data.byMethod.BANK_TRANSFER}`);
    } else {
      doc.fontSize(14).text(`Report type: ${type} is not fully detailed for PDF yet. Please use CSV export on frontend.`);
    }
    
    doc.end();
  }

  async getRevenueReport(tenantId: string) {
    const [totalRevenueAgg, methodAggs] = await Promise.all([
      this.prisma.payment.aggregate({
        where: {
          tenantId,
          paymentStatus: PaymentStatus.PAID,
          deletedAt: null,
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.groupBy({
        by: ['paymentMethod'],
        where: {
          tenantId,
          paymentStatus: PaymentStatus.PAID,
          deletedAt: null,
        },
        _sum: { amount: true },
      }),
    ]);

    const totalRevenue = Number(totalRevenueAgg._sum.amount || 0);
    let cashRevenue = 0;
    let upiRevenue = 0;
    let cardRevenue = 0;
    let bankTransferRevenue = 0;

    for (const agg of methodAggs) {
      const sum = Number(agg._sum.amount || 0);
      switch (agg.paymentMethod) {
        case PaymentMethod.CASH:
          cashRevenue = sum;
          break;
        case PaymentMethod.UPI:
          upiRevenue = sum;
          break;
        case PaymentMethod.CARD:
          cardRevenue = sum;
          break;
        case PaymentMethod.BANK_TRANSFER:
          bankTransferRevenue = sum;
          break;
      }
    }

    return {
      totalRevenue,
      byMethod: {
        CASH: cashRevenue,
        UPI: upiRevenue,
        CARD: cardRevenue,
        BANK_TRANSFER: bankTransferRevenue,
      },
      byStatus: {
        PENDING: 0,
        PAID: totalRevenue,
        FAILED: 0,
        REFUNDED: 0,
      },
    };
  }

  async getSubscriptionReport(tenantId: string) {
    const subGroups = await this.prisma.subscription.groupBy({
      by: ['status'],
      where: { tenantId, deletedAt: null },
      _count: true,
    });

    let activeSubscriptions = 0;
    let expiredSubscriptions = 0;
    let cancelledSubscriptions = 0;
    let pendingSubscriptions = 0;

    for (const group of subGroups) {
      const count = group._count;
      switch (group.status) {
        case SubscriptionStatus.ACTIVE:
          activeSubscriptions = count;
          break;
        case SubscriptionStatus.EXPIRED:
          expiredSubscriptions = count;
          break;
        case SubscriptionStatus.CANCELLED:
          cancelledSubscriptions = count;
          break;
        case SubscriptionStatus.PENDING:
          pendingSubscriptions = count;
          break;
      }
    }

    return {
      activeSubscriptions,
      expiredSubscriptions,
      cancelledSubscriptions,
      pendingSubscriptions,
    };
  }

  async getExpiringMembersReport(
    tenantId: string,
    query: ExpiringMembersQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const now = new Date();
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + (query.days ?? 30));

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
        select: {
          endDate: true,
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          membershipPlan: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { endDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.subscription.count({ where }),
    ]);

    const data = subscriptions.map((sub: any) => {
      const diffTime = new Date(sub.endDate).getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        member: {
          id: sub.member.id,
          name: `${sub.member.firstName} ${sub.member.lastName}`,
          phone: sub.member.phone,
        },
        plan: {
          id: sub.membershipPlan.id,
          name: sub.membershipPlan.name,
        },
        expiryDate: sub.endDate,
        daysRemaining,
      };
    });

    return {
      data,
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
}
