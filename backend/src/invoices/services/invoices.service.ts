import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { InvoiceDto } from '../dto/invoice.dto.js';
import { ListInvoicesQueryDto } from '../dto/list-invoices-query.dto.js';
import { PaginatedInvoicesDto } from '../dto/paginated-invoices.dto.js';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllInvoices(
    tenantId: string,
    query: ListInvoicesQueryDto,
  ): Promise<PaginatedInvoicesDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const whereClause: any = { tenantId };
    if (query.memberId) {
      whereClause.memberId = query.memberId;
    }
    if (query.status) {
      whereClause.status = query.status;
    }
    if (query.paymentMethod) {
      whereClause.payments = {
        some: {
          paymentMethod: query.paymentMethod as any,
        }
      };
    }
    if (query.dateFrom || query.dateTo) {
      whereClause.issuedAt = {};
      if (query.dateFrom) whereClause.issuedAt.gte = new Date(query.dateFrom);
      if (query.dateTo) whereClause.issuedAt.lte = new Date(query.dateTo);
    }
    if (query.minAmount !== undefined || query.maxAmount !== undefined) {
      whereClause.amount = {};
      if (query.minAmount !== undefined) whereClause.amount.gte = query.minAmount;
      if (query.maxAmount !== undefined) whereClause.amount.lte = query.maxAmount;
    }
    if (query.membershipPlanId) {
      whereClause.subscription = {
        membershipPlanId: query.membershipPlanId
      };
    }

    const [invoices, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where: whereClause,
        orderBy: { issuedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          tenantId: true,
          memberId: true,
          subscriptionId: true,
          invoiceNumber: true,
          amount: true,
          status: true,
          issuedAt: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          subscription: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              membershipPlan: {
                select: {
                  id: true,
                  name: true,
                  durationDays: true,
                },
              },
            },
          },
          payments: {
            select: {
              id: true,
              paymentMethod: true,
              paymentStatus: true,
              amount: true,
              paidAt: true,
            },
          },
        },
      }),
      this.prisma.invoice.count({ where: whereClause }),
    ]);

    return {
      data: invoices.map((invoice) => this.mapToDto(invoice)),
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

  async getInvoiceById(tenantId: string, id: string): Promise<InvoiceDto> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        tenantId: true,
        memberId: true,
        subscriptionId: true,
        invoiceNumber: true,
        amount: true,
        status: true,
        issuedAt: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        subscription: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            membershipPlan: {
              select: {
                id: true,
                name: true,
                durationDays: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            paymentMethod: true,
            paymentStatus: true,
            transactionReference: true,
            razorpayOrderId: true,
            razorpayPaymentId: true,
            gateway: true,
            gatewayStatus: true,
            paidAt: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return this.mapToDto(invoice);
  }

  private mapToDto(invoice: any): InvoiceDto {
    const amount = invoice.amount ? Number(invoice.amount) : 0;
    
    // Calculate total paid from all successful payments
    let totalPaid = 0;
    if (invoice.payments && Array.isArray(invoice.payments)) {
      totalPaid = invoice.payments
        .filter((p: any) => p.paymentStatus === 'PAID')
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    }
    
    const amountDue = Math.max(0, amount - totalPaid);

    return {
      id: invoice.id,
      tenantId: invoice.tenantId,
      memberId: invoice.memberId,
      subscriptionId: invoice.subscriptionId,
      invoiceNumber: invoice.invoiceNumber,
      amount,
      amountDue,
      status: invoice.status,
      issuedAt: invoice.issuedAt,
      notes: invoice.notes,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      member: invoice.member,
      subscription: invoice.subscription,
      payments: invoice.payments,
    };
  }
}
