import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface PlatformDashboardDto {
  totalGyms: number;
  activeGyms: number;
  trialGyms: number;
  expiredGyms: number;
  suspendedGyms: number;
}

export interface RevenueByPlanDto {
  planName: string;
  revenue: number;
}

export interface RevenueMetricsDto {
  mrr: number;
  arr: number;
  revenueThisMonth: number;
  revenueByPlan: RevenueByPlanDto[];
}

export interface TenantListItemDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'EXPIRED' | 'SUSPENDED';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    members: number;
    subscriptions: number;
  };
}

export interface PaginatedTenantsDto {
  data: TenantListItemDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface TenantOwnerDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface TenantDetailDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  gymLogoUrl: string | null;
  gymDescription: string | null;
  gymWebsite: string | null;
  gstNumber: string | null;
  timezone: string;
  currency: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'EXPIRED' | 'SUSPENDED';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  owner: TenantOwnerDto | null;
  memberCount: number;
  subscriptionCount: number;
  userCount: number;
}

export const usePlatformDashboard = () => {
  return useQuery({
    queryKey: ['platform', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get<PlatformDashboardDto>('/platform/dashboard');
      return data;
    },
  });
};

export const useTenants = (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
  return useQuery({
    queryKey: ['platform', 'tenants', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedTenantsDto>('/platform/tenants', { params });
      return data;
    },
  });
};

export const useTenant = (id: string) => {
  return useQuery({
    queryKey: ['platform', 'tenants', id],
    queryFn: async () => {
      const { data } = await api.get<TenantDetailDto>(`/platform/tenants/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useSuspendTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<TenantDetailDto>(`/platform/tenants/${id}/suspend`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants', id] });
    },
  });
};

export const useActivateTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<TenantDetailDto>(`/platform/tenants/${id}/activate`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants', id] });
    },
  });
};

export const usePlatformRevenue = () => {
  return useQuery({
    queryKey: ['platform', 'revenue'],
    queryFn: async () => {
      const { data } = await api.get<RevenueMetricsDto>('/platform/revenue');
      return data;
    },
  });
};

// Mock data for Platform Plans as requested
export const usePlatformPlans = () => {
  return useQuery({
    queryKey: ['platform', 'plans'],
    queryFn: async () => {
      // Return static mock data for the Future-ready CRUD layout
      return [
        {
          id: 'plan-1',
          name: 'Starter',
          price: 29,
          status: 'ACTIVE',
          features: ['Up to 100 members', 'Basic Analytics', 'Email Support'],
        },
        {
          id: 'plan-2',
          name: 'Growth',
          price: 79,
          status: 'ACTIVE',
          features: ['Up to 500 members', 'Advanced Analytics', 'Priority Support', 'Custom Domain'],
        },
        {
          id: 'plan-3',
          name: 'Enterprise',
          price: 199,
          status: 'ACTIVE',
          features: ['Unlimited members', 'White-label App', '24/7 Phone Support', 'Dedicated Account Manager'],
        },
      ];
    },
  });
};
