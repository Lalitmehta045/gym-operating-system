import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Member } from './useMembers';
import { Subscription } from './useSubscriptions';

// Interfaces
export interface Payment {
  id: string;
  memberId: string;
  subscriptionId?: string;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  transactionReference?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  memberName?: string;
  memberCode?: string | null;
  member?: Member;
  subscription?: Subscription;
}

export interface PaymentsResponse {
  data: Payment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetPaymentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  memberId?: string;
  subscriptionId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePaymentDto {
  memberId: string;
  invoiceId: string;
  subscriptionId?: string;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  transactionReference?: string;
  notes?: string;
}

// Hooks
export const usePayments = (params?: GetPaymentsParams) => {
  return useQuery<PaymentsResponse>({
    queryKey: ['payments', params],
    queryFn: async () => {
      const filteredParams = params
        ? Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== "" && v !== undefined)
          )
        : {};
      const { data } = await api.get<PaymentsResponse>('/payments', { params: filteredParams });
      return data;
    },
  });
};

export const usePayment = (id: string) => {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: async () => {
      const { data } = await api.get<Payment>(`/payments/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newPayment: CreatePaymentDto) => {
      const { data } = await api.post<Payment>('/payments', newPayment);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['reports', 'revenue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
