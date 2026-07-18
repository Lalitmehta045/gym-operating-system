import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface LedgerEvent {
  id: string;
  type: string;
  date: string;
  amount: number;
  status: string;
  description: string;
  metadata?: any;
}

export interface FinancialSummary {
  totalPaid: number;
  outstanding: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  lastPaymentDate?: string;
  nextRenewalDate?: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalOutstanding: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
}

export const useMemberLedger = (memberId: string) => {
  return useQuery({
    queryKey: ['financials', 'ledger', memberId],
    queryFn: async () => {
      const { data } = await api.get<LedgerEvent[]>(`/financials/members/${memberId}/ledger`);
      return data;
    },
    enabled: !!memberId,
  });
};

export const useMemberFinancialSummary = (memberId: string) => {
  return useQuery({
    queryKey: ['financials', 'summary', memberId],
    queryFn: async () => {
      const { data } = await api.get<FinancialSummary>(`/financials/members/${memberId}/summary`);
      return data;
    },
    enabled: !!memberId,
  });
};

export const useInvoiceTimeline = (invoiceId: string) => {
  return useQuery({
    queryKey: ['financials', 'timeline', invoiceId],
    queryFn: async () => {
      const { data } = await api.get<LedgerEvent[]>(`/financials/invoices/${invoiceId}/timeline`);
      return data;
    },
    enabled: !!invoiceId,
  });
};

export const useDashboardFinancialMetrics = (query?: { dateFrom?: string; dateTo?: string }) => {
  return useQuery({
    queryKey: ['financials', 'dashboard', query?.dateFrom, query?.dateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query?.dateFrom) params.append('dateFrom', query.dateFrom);
      if (query?.dateTo) params.append('dateTo', query.dateTo);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const { data } = await api.get<DashboardMetrics>(`/financials/dashboard${queryString}`);
      return data;
    },
  });
};
