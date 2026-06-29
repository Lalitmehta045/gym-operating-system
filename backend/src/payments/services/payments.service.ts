import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
    // Parallelize independent DB queries
    const [member, subscription] = await Promise.all([
      this.prisma.member.findFirst({
        where: { id: dto.memberId, tenantId, deletedAt: null },
      }),
      dto.subscriptionId
        ? this.prisma.subscription.findFirst({
            where: { id: dto.subscriptionId, tenantId, deletedAt: null },
          })
        : Promise.resolve(null),
    ]);

    if (!member) throw new NotFoundException('Member not found');
    if (dto.subscriptionId && !subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const status = dto.paymentStatus || PaymentStatus.PENDING;

    // Generate invoice number (same pattern as renewSubscription)
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}-${randomUUID().slice(-8).toUpperCase()}`;

    const payment = await this.prisma.$transaction(async (tx) => {
      // Step 1: Create payment
      const newPayment = await tx.payment.create({
        data: {
          tenantId,
          memberId: dto.memberId,
          subscriptionId: dto.subscriptionId ?? null,
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          paymentStatus: status,
          transactionReference: dto.transactionReference ?? null,
          paidAt: status === PaymentStatus.PAID ? new Date() : null,
          notes: dto.notes ?? null,
        },
      });

      // Step 2: If payment is PAID and has subscriptionId,
      // activate the subscription
      if (status === PaymentStatus.PAID && dto.subscriptionId) {
        await tx.subscription.update({
          where: { id: dto.subscriptionId },
          data: { status: SubscriptionStatus.ACTIVE },
        });
      }

      // Step 3: If payment is PAID, generate invoice
      if (status === PaymentStatus.PAID) {
        await tx.invoice.create({
          data: {
            tenantId,
            memberId: dto.memberId,
            subscriptionId: dto.subscriptionId ?? null,
            paymentId: newPayment.id,
            invoiceNumber,
            amount: newPayment.amount,
          },
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

    const [payments, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
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
      this.prisma.payment.count({ where: { tenantId, deletedAt: null } }),
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
