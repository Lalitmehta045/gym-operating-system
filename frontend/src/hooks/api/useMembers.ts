import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

// Interfaces
export interface Member {
  id: string;
  memberCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  dateOfBirth?: string;
  photoUrl?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  heightCm?: number;
  weightKg?: number;
  fitnessGoal?: string;
  notes?: string;
  source?: 'WALK_IN' | 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'REFERRAL' | 'WEBSITE' | 'OTHER';
  occupation?: string;
  bloodGroup?: 'A_POSITIVE' | 'A_NEGATIVE' | 'B_POSITIVE' | 'B_NEGATIVE' | 'AB_POSITIVE' | 'AB_NEGATIVE' | 'O_POSITIVE' | 'O_NEGATIVE';
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'PENDING';
  isActive: boolean;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MembersResponse {
  data: Member[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetMembersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  gender?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateMemberDto {
  memberCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  heightCm?: number;
  weightKg?: number;
  fitnessGoal?: string;
  notes?: string;
  source?: string;
  occupation?: string;
  bloodGroup?: string;
}

export type UpdateMemberDto = Partial<CreateMemberDto> & { status?: string };

// Hooks
export const useMembers = (params?: GetMembersParams) => {
  return useQuery({
    queryKey: ['members', params],
    queryFn: async () => {
      // Filter out empty strings to avoid validation errors in backend
      const filteredParams = params
        ? Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== "" && v !== undefined)
          )
        : {};
      const { data } = await api.get<MembersResponse>('/members', {
        params: filteredParams,
      });
      return data;
    },
  });
};

export const useMember = (id: string) => {
  return useQuery({
    queryKey: ['members', id],
    queryFn: async () => {
      const { data } = await api.get<Member>(`/members/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useMemberQr = (id: string) => {
  return useQuery({
    queryKey: ['members', id, 'qr'],
    queryFn: async () => {
      const { data } = await api.get<{ qrCodeUrl: string }>(`/members/${id}/qr`);
      return data;
    },
    enabled: !!id,
    staleTime: 0,
  });
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newMember: CreateMemberDto) => {
      const { data } = await api.post<Member>('/members', newMember);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateMember = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updateData: UpdateMemberDto) => {
      const { data } = await api.patch<Member>(`/members/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/members/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useRestoreMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/members/${id}/restore`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
