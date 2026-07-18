import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class FinancialMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates the total revenue (sum of all PAID payments) for a member or whole gym.
   */
  async calculateTotalRevenue(tenantId: string, memberId?: string, dateFilter?: any): Promise<number> {
    const aggregate = await this.prisma.payment.aggregate({
      where: {
        tenantId,
        paymentStatus: 'PAID',
        deletedAt: null,
        ...(memberId ? { memberId } : {}),
        ...dateFilter,
      },
      _sum: {
        amount: true,
      },
    });
    return Number(aggregate._sum.amount || 0);
  }

  /**
   * Calculates total outstanding amount.
   * Based on the sum of all invoices minus the sum of all PAID payments for those invoices.
   */
  async calculateOutstanding(tenantId: string, memberId?: string, dateFilter?: any): Promise<number> {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        ...(memberId ? { memberId } : {}),
        ...dateFilter,
      },
      select: {
        amount: true,
        payments: {
          where: { paymentStatus: 'PAID', deletedAt: null },
          select: { amount: true },
        },
      },
    });

    let totalOutstanding = 0;
    for (const inv of invoices) {
      const invAmount = Number(inv.amount);
      const paidAmount = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const diff = invAmount - paidAmount;
      if (diff > 0) {
        totalOutstanding += diff;
      }
    }
    return totalOutstanding;
  }

  /**
   * Returns invoice counts: total, paid, and pending
   */
  async getInvoiceCounts(tenantId: string, memberId?: string, dateFilter?: any) {
    const whereClause = {
      tenantId,
      ...(memberId ? { memberId } : {}),
      ...dateFilter,
    };

    const totalInvoices = await this.prisma.invoice.count({
      where: whereClause,
    });

    const paidInvoices = await this.prisma.invoice.count({
      where: { ...whereClause, status: 'PAID' },
    });

    const pendingInvoices = await this.prisma.invoice.count({
      where: {
        ...whereClause,
        status: { in: ['DUE', 'PARTIALLY_PAID'] },
      },
    });

    return { totalInvoices, paidInvoices, pendingInvoices };
  }
}
