import {
  PaymentMethod,
  PaymentStatus,
} from '../../../generated/prisma/client.js';

export class PaymentDto {
  id: string;
  tenantId: string;
  memberId: string;
  subscriptionId: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionReference: string | null;
  paidAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    memberCode: string;
  } | null;
}
