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

    const [invoices, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where: { tenantId },
        orderBy: { issuedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          tenantId: true,
          memberId: true,
          subscriptionId: true,
          paymentId: true,
          invoiceNumber: true,
          amount: true,
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
          payment: {
            select: {
              id: true,
              paymentMethod: true,
              paymentStatus: true,
              paidAt: true,
            },
          },
        },
      }),
      this.prisma.invoice.count({ where: { tenantId } }),
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
        paymentId: true,
        invoiceNumber: true,
        amount: true,
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
        payment: {
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
    return {
      id: invoice.id,
      tenantId: invoice.tenantId,
      memberId: invoice.memberId,
      subscriptionId: invoice.subscriptionId,
      paymentId: invoice.paymentId,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount ? Number(invoice.amount) : 0,
      issuedAt: invoice.issuedAt,
      notes: invoice.notes,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      member: invoice.member,
      subscription: invoice.subscription,
      payment: invoice.payment,
    };
  }
}
