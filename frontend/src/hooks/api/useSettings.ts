import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  tenantId: string | null;
}

export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
}

export interface GymProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  gymLogoUrl?: string | null;
  gymDescription?: string | null;
  gymWebsite?: string | null;
  gstNumber?: string | null;
  timezone: string;
  currency: string;
}

export interface UpdateGymProfileDto {
  country?: string;
  state?: string;
  city?: string;
  gymDescription?: string;
  gymWebsite?: string;
  gstNumber?: string;
  timezone?: string;
  currency?: string;
}

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<UserProfile>('/auth/me');
      return data;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updateData: UpdateProfileDto) => {
      const { data } = await api.patch<UserProfile>('/auth/me', updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useGymProfile = () => {
  return useQuery({
    queryKey: ['gymProfile'],
    queryFn: async () => {
      const { data } = await api.get<GymProfile>('/tenant/profile');
      return data;
    },
  });
};

export const useUpdateGymProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updateData: UpdateGymProfileDto) => {
      const { data } = await api.patch<GymProfile>('/tenant/profile', updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gymProfile'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (passwordData: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const { data } = await api.patch('/auth/change-password', passwordData);
      return data;
    },
  });
};

export const useLogoutAllSessions = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/auth/logout-all');
      return data;
    },
  });
};
