import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreatePaymentDto } from '../dto/create-payment.dto.js';
import { PaymentDto } from '../dto/payment.dto.js';
import { ListPaymentsQueryDto } from '../dto/list-payments-query.dto.js';
import { PaginatedPaymentsDto } from '../dto/paginated-payments.dto.js';
import { PaymentStatus, SubscriptionStatus } from '../../../generated/prisma/client.js';
import { WhatsappService } from '../../whatsapp/services/whatsapp.service.js';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
  ) {}

  async createPayment(
    tenantId: string,
    dto: CreatePaymentDto,
  ): Promise<PaymentDto> {
    const status = dto.paymentStatus || PaymentStatus.PENDING;

    const payment = await this.prisma.$transaction(async (tx) => {
      // 1. Idempotency Check: if transactionReference is provided, check if payment already exists
      if (dto.transactionReference) {
        const existingPayment = await tx.payment.findFirst({
          where: {
            tenantId,
            transactionReference: dto.transactionReference,
            paymentStatus: PaymentStatus.PAID,
          },
        });
        if (existingPayment) {
          return existingPayment;
        }
      }

      // 2. Member validation
      const member = await tx.member.findFirst({
        where: { id: dto.memberId, tenantId, deletedAt: null },
      });
      if (!member) throw new NotFoundException('Member not found');

      // 3. Concurrency Lock: lock the invoice row using FOR UPDATE
      await tx.$executeRaw`SELECT * FROM invoices WHERE id = ${dto.invoiceId}::uuid FOR UPDATE`;

      const invoice = await tx.invoice.findFirst({
        where: { id: dto.invoiceId, tenantId },
        include: { payments: true },
      });
      if (!invoice) throw new NotFoundException('Invoice not found');

      // Guard: reject payment on cancelled invoice
      if (invoice.status === 'CANCELLED') {
        throw new BadRequestException('Cannot record payment against a cancelled invoice');
      }

      // Guard: reject payment on already-paid invoice
      if (invoice.status === 'PAID') {
        throw new BadRequestException('Invoice is already fully paid');
      }

      // Calculate outstanding balance
      const totalPaid = invoice.payments
        .filter((p) => p.paymentStatus === PaymentStatus.PAID)
        .reduce((sum, p) => sum + Number(p.amount), 0);
        
      const amountDue = Number(invoice.amount) - totalPaid;
      
      if (status === PaymentStatus.PAID && dto.amount > amountDue) {
        throw new BadRequestException(`Payment amount ₹${dto.amount} exceeds outstanding balance ₹${amountDue}`);
      }

      // Step 1: Create payment
      const newPayment = await tx.payment.create({
        data: {
          tenantId,
          memberId: dto.memberId,
          subscriptionId: invoice.subscriptionId,
          invoiceId: invoice.id,
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          paymentStatus: status,
          transactionReference: dto.transactionReference ?? null,
          paidAt: status === PaymentStatus.PAID ? new Date() : null,
          notes: dto.notes ?? null,
        },
      });

      // Step 2: Recalculate invoice status
      const newTotalPaid = status === PaymentStatus.PAID ? totalPaid + Number(dto.amount) : totalPaid;
      
      let newInvoiceStatus = 'DUE';
      if (newTotalPaid >= Number(invoice.amount)) {
        newInvoiceStatus = 'PAID';
      } else if (newTotalPaid > 0) {
        newInvoiceStatus = 'PARTIALLY_PAID';
      }

      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: newInvoiceStatus as any },
      });

      // Step 3: If invoice is PAID and has subscriptionId, activate the subscription
      if (newInvoiceStatus === 'PAID' && invoice.subscriptionId) {
        await tx.subscription.update({
          where: { id: invoice.subscriptionId },
          data: { status: SubscriptionStatus.ACTIVE },
        });
      }

      return newPayment;
    });

    // Fire-and-forget WhatsApp notification
    if (status === PaymentStatus.PAID) {
      this.whatsappService
        .sendPaymentSuccess(tenantId, dto.memberId, Number(dto.amount))
        .catch((err) =>
          this.logger.error('Failed to send payment success notification', err),
        );
    }

    return this.mapToDto(payment);
  }

  async getAllPayments(
    tenantId: string,
    query: ListPaymentsQueryDto,
  ): Promise<PaginatedPaymentsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId, deletedAt: null };

    if (query.status) {
      where.paymentStatus = query.status;
    }

    if (query.method) {
      where.paymentMethod = query.method;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    if (query.search) {
      where.OR = [
        { transactionReference: { contains: query.search, mode: 'insensitive' } },
        { member: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { member: { lastName: { contains: query.search, mode: 'insensitive' } } },
        { member: { email: { contains: query.search, mode: 'insensitive' } } },
        { member: { memberCode: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [payments, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          tenantId: true,
          memberId: true,
          subscriptionId: true,
          amount: true,
          paymentMethod: true,
          paymentStatus: true,
          transactionReference: true,
          paidAt: true,
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
              memberCode: true,
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments.map((payment) => this.mapToDto(payment)),
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

  async getPaymentById(tenantId: string, id: string): Promise<PaymentDto> {
    const payment = await this.prisma.payment.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            memberCode: true,
          }
        }
      }
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return this.mapToDto(payment);
  }

  private mapToDto(payment: any): PaymentDto {
    return {
      id: payment.id,
      tenantId: payment.tenantId,
      memberId: payment.memberId,
      subscriptionId: payment.subscriptionId,
      amount: payment.amount ? Number(payment.amount) : 0,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      transactionReference: payment.transactionReference,
      paidAt: payment.paidAt,
      notes: payment.notes,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      member: payment.member ? {
        id: payment.member.id,
        firstName: payment.member.firstName,
        lastName: payment.member.lastName,
        email: payment.member.email,
        phone: payment.member.phone,
        memberCode: payment.member.memberCode,
      } : null,
    };
  }
}
