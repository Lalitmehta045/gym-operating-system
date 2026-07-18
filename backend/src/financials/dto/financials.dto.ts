export class LedgerEventDto {
  id: string; // The original entity ID
  type: 
    | 'SUBSCRIPTION_CREATED' 
    | 'SUBSCRIPTION_RENEWED' 
    | 'INVOICE_GENERATED' 
    | 'INVOICE_CANCELLED' 
    | 'PAYMENT_PARTIAL' 
    | 'PAYMENT_FULL'
    | 'REFUND'
    | 'WALLET_CREDIT'
    | 'DISCOUNT_APPLIED';
  date: Date;
  amount: number;
  status: string;
  description: string;
  metadata?: any;
}

export class FinancialSummaryDto {
  totalPaid: number;
  outstanding: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  lastPaymentDate?: Date;
  nextRenewalDate?: Date;
}

export class DashboardFinancialMetricsDto {
  totalRevenue: number;
  totalOutstanding: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
}
