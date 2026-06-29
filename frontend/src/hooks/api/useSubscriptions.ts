import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Member } from './useMembers';
import { Plan } from './usePlans';

// Interfaces
export interface Subscription {
  id: string;
  memberId: string;
  membershipPlanId: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  autoRenew: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  member?: Member;
  membershipPlan?: Plan;
}

export interface SubscriptionsResponse {
  data: Subscription[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetSubscriptionsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  memberId?: string;
  membershipPlanId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateSubscriptionDto {
  memberId: string;
  membershipPlanId: string;
  startDate: string;
  endDate: string;
  amount: number;
  notes?: string;
}

export type UpdateSubscriptionDto = Partial<CreateSubscriptionDto> & { status?: string };

export interface RenewSubscriptionDto {
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
  notes?: string;
}

export type RenewSubscriptionInput = string | ({ id: string } & RenewSubscriptionDto);

// Hooks
export const useSubscriptions = (params?: GetSubscriptionsParams) => {
  return useQuery<SubscriptionsResponse>({
    queryKey: ['subscriptions', params],
    queryFn: async () => {
      const filteredParams = params
        ? Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== "" && v !== undefined)
          )
        : {};
      const { data } = await api.get<SubscriptionsResponse>('/subscriptions', { params: filteredParams });
      return data;
    },
  });
};

export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: ['subscriptions', id],
    queryFn: async () => {
      const { data } = await api.get<Subscription>(`/subscriptions/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newSubscription: CreateSubscriptionDto) => {
      const { data } = await api.post<Subscription>('/subscriptions', newSubscription);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateSubscription = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updateData: UpdateSubscriptionDto) => {
      const { data } = await api.patch<Subscription>(`/subscriptions/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', id] });
    },
  });
};

export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/subscriptions/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useRenewSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RenewSubscriptionInput) => {
      const id = typeof input === 'string' ? input : input.id;
      const body: RenewSubscriptionDto =
        typeof input === 'string'
          ? { paymentMethod: 'CASH' }
          : { paymentMethod: input.paymentMethod, notes: input.notes };

      const { data } = await api.post<Subscription>(`/subscriptions/${id}/renew`, body);
      return data;
    },
    onSuccess: (_, input) => {
      const id = typeof input === 'string' ? input : input.id;
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useExpiringSubscriptions = (days: number = 7) => {
  return useQuery({
    queryKey: ['subscriptions', 'expiring', days],
    queryFn: async () => {
      const { data } = await api.get<SubscriptionsResponse>(`/subscriptions/expiring`, { params: { days } });
      return data;
    },
  });
};
