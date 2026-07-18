import { InvoiceStatus } from '../../../generated/prisma/client.js';

export class InvoiceDto {
  id: string;
  tenantId: string;
  memberId: string;
  subscriptionId: string | null;
  invoiceNumber: string;
  amount: number;
  amountDue: number;
  status: InvoiceStatus;
  issuedAt: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  member?: any;
  subscription?: any;
  payments?: any[];
}
