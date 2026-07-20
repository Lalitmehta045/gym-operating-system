import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Member } from './useMembers';
import { Subscription } from './useSubscriptions';
import { Payment } from './usePayments';

// Interfaces
export interface Invoice {
  id: string;
  memberId: string;
  subscriptionId?: string;
  paymentId?: string;
  invoiceNumber: string;
  amount: number;
  amountDue?: number;
  status?: string;
  issuedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  member?: Member;
  subscription?: Subscription;
  payment?: Payment;
  payments?: Payment[];
}

export interface InvoicesResponse {
  data: Invoice[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetInvoicesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  membershipPlanId?: string;
  memberId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Hooks
export const useInvoices = (params?: GetInvoicesParams) => {
  return useQuery<InvoicesResponse>({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const filteredParams = params
        ? Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== "" && v !== undefined)
          )
        : {};
      const { data } = await api.get<InvoicesResponse>('/invoices', { params: filteredParams });
      return data;
    },
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      const { data } = await api.get<Invoice>(`/invoices/${id}`);
      return data;
    },
    enabled: !!id,
  });
};
