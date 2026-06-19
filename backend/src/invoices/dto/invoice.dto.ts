export class InvoiceDto {
  id: string;
  tenantId: string;
  memberId: string;
  subscriptionId: string | null;
  paymentId: string | null;
  invoiceNumber: string;
  amount: number;
  issuedAt: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
