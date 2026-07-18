import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export function useGetStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data } = await api.get('/staff');
      return data;
    },
  });
}

export function useGetTrainers() {
  return useQuery({
    queryKey: ['staff', 'trainers'],
    queryFn: async () => {
      const { data } = await api.get('/staff', {
        params: { role: 'TRAINER' },
      });
      return data;
    },
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: responseData } = await api.post('/staff', data);
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useUpdateStaffRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { data } = await api.patch(`/staff/${id}/role`, { role });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useDeactivateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/staff/${id}/deactivate`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useReactivateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/staff/${id}/reactivate`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}
