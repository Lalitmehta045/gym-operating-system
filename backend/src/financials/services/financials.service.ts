import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { FinancialMetricsService } from './financial-metrics.service.js';
import { LedgerEventDto, FinancialSummaryDto, DashboardFinancialMetricsDto } from '../dto/financials.dto.js';

@Injectable()
export class FinancialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: FinancialMetricsService,
  ) {}

  async getMemberLedger(tenantId: string, memberId: string): Promise<LedgerEventDto[]> {
    // 1. Fetch Subscriptions
    const subscriptions = await this.prisma.subscription.findMany({
      where: { tenantId, memberId, deletedAt: null },
      include: { membershipPlan: true }
    });

    // 2. Fetch Invoices
    const invoices = await this.prisma.invoice.findMany({
      where: { tenantId, memberId },
    });

    // 3. Fetch Payments
    const payments = await this.prisma.payment.findMany({
      where: { tenantId, memberId, deletedAt: null },
      include: { invoice: true }
    });

    const events: LedgerEventDto[] = [];

    // Process Subscriptions
    for (const sub of subscriptions) {
      events.push({
        id: sub.id,
        type: 'SUBSCRIPTION_CREATED',
        date: sub.createdAt,
        amount: Number(sub.amount),
        status: sub.status,
        description: `Subscribed to ${sub.membershipPlan?.name}`,
        metadata: { startDate: sub.startDate, endDate: sub.endDate }
      });
    }

    // Process Invoices
    for (const inv of invoices) {
      events.push({
        id: inv.id,
        type: inv.status === 'CANCELLED' ? 'INVOICE_CANCELLED' : 'INVOICE_GENERATED',
        date: inv.issuedAt,
        amount: Number(inv.amount),
        status: inv.status,
        description: `Invoice ${inv.invoiceNumber} generated`,
        metadata: { invoiceNumber: inv.invoiceNumber }
      });
    }

    // Process Payments
    for (const pay of payments) {
      let type: LedgerEventDto['type'] = 'PAYMENT_FULL';
      
      if (pay.paymentStatus === 'REFUNDED') {
        type = 'REFUND';
      } else if (pay.invoice) {
        // Check if this payment's invoice is fully paid.
        // If invoice is PAID, the last payment that settled it is PAYMENT_FULL.
        // If invoice is still partially paid or due, it's PAYMENT_PARTIAL.
        if (pay.invoice.status !== 'PAID') {
          type = 'PAYMENT_PARTIAL';
        }
      }

      events.push({
        id: pay.id,
        type,
        date: pay.paidAt || pay.createdAt,
        amount: Number(pay.amount),
        status: pay.paymentStatus,
        description: `Payment via ${pay.paymentMethod}`,
        metadata: { reference: pay.transactionReference, invoiceNumber: pay.invoice?.invoiceNumber }
      });
    }

    // Sort chronologically (oldest to newest)
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return events;
  }

  async getMemberSummary(tenantId: string, memberId: string): Promise<FinancialSummaryDto> {
    const totalPaid = await this.metrics.calculateTotalRevenue(tenantId, memberId);
    const outstanding = await this.metrics.calculateOutstanding(tenantId, memberId);
    const counts = await this.metrics.getInvoiceCounts(tenantId, memberId);

    // Find last payment
    const lastPayment = await this.prisma.payment.findFirst({
      where: { tenantId, memberId, paymentStatus: 'PAID', deletedAt: null },
      orderBy: { paidAt: 'desc' },
    });

    // Find next renewal (active subscription end date)
    const activeSub = await this.prisma.subscription.findFirst({
      where: { tenantId, memberId, status: 'ACTIVE', deletedAt: null },
      orderBy: { endDate: 'desc' },
    });

    return {
      totalPaid,
      outstanding,
      totalInvoices: counts.totalInvoices,
      paidInvoices: counts.paidInvoices,
      pendingInvoices: counts.pendingInvoices,
      lastPaymentDate: lastPayment?.paidAt || lastPayment?.createdAt,
      nextRenewalDate: activeSub?.endDate,
    };
  }

  async getInvoiceTimeline(tenantId: string, invoiceId: string): Promise<LedgerEventDto[]> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { tenantId, id: invoiceId },
      include: { payments: { where: { deletedAt: null } } }
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    const events: LedgerEventDto[] = [];
    events.push({
      id: invoice.id,
      type: invoice.status === 'CANCELLED' ? 'INVOICE_CANCELLED' : 'INVOICE_GENERATED',
      date: invoice.issuedAt,
      amount: Number(invoice.amount),
      status: invoice.status,
      description: `Invoice ${invoice.invoiceNumber} generated`
    });

    for (const pay of invoice.payments) {
      let type: LedgerEventDto['type'] = 'PAYMENT_FULL';
      if (pay.paymentStatus === 'REFUNDED') type = 'REFUND';
      else if (Number(pay.amount) < Number(invoice.amount)) type = 'PAYMENT_PARTIAL';

      events.push({
        id: pay.id,
        type,
        date: pay.paidAt || pay.createdAt,
        amount: Number(pay.amount),
        status: pay.paymentStatus,
        description: `Payment via ${pay.paymentMethod}`
      });
    }

    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return events;
  }

  async getDashboardMetrics(tenantId: string, query?: any): Promise<DashboardFinancialMetricsDto> {
    let dateFilter = {};
    if (query?.dateFrom || query?.dateTo) {
      dateFilter = {
        createdAt: {
          ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
          ...(query.dateTo && { lte: new Date(new Date(query.dateTo).setHours(23, 59, 59, 999)) }),
        },
      };
    }

    const totalRevenue = await this.metrics.calculateTotalRevenue(tenantId, undefined, dateFilter);
    const totalOutstanding = await this.metrics.calculateOutstanding(tenantId, undefined, dateFilter);
    const counts = await this.metrics.getInvoiceCounts(tenantId, undefined, dateFilter);

    return {
      totalRevenue,
      totalOutstanding,
      totalInvoices: counts.totalInvoices,
      paidInvoices: counts.paidInvoices,
      pendingInvoices: counts.pendingInvoices,
    };
  }
}
