import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

// Interfaces
export interface Plan {
  id: string;
  name: string;
  description?: string;
  planType: 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUAL' | 'CUSTOM';
  durationDays: number;
  price: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlansResponse {
  data: Plan[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetPlansParams {
  page?: number;
  limit?: number;
  search?: string;
  planType?: string;
  isActive?: boolean | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePlanDto {
  name: string;
  description?: string;
  planType: string;
  durationDays: number;
  price: number;
  displayOrder?: number;
  isActive?: boolean;
}

export type UpdatePlanDto = Partial<CreatePlanDto>;

// Hooks
export const usePlans = (params?: GetPlansParams) => {
  return useQuery({
    queryKey: ['plans', params],
    queryFn: async () => {
      const filteredParams = params
        ? Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== "" && v !== undefined)
          )
        : {};
      const { data } = await api.get<PlansResponse>('/plans', { params: filteredParams });
      return data;
    },
  });
};

export const usePlan = (id: string) => {
  return useQuery({
    queryKey: ['plans', id],
    queryFn: async () => {
      const { data } = await api.get<Plan>(`/plans/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newPlan: CreatePlanDto) => {
      const { data } = await api.post<Plan>('/plans', newPlan);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
};

export const useUpdatePlan = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updateData: UpdatePlanDto) => {
      const { data } = await api.patch<Plan>(`/plans/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plans', id] });
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/plans/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
};
