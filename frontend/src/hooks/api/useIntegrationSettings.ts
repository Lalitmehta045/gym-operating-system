import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface IntegrationSettings {
  razorpayEnabled: boolean;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
  whatsappEnabled: boolean;
  whatsappPhoneNumberId?: string;
  whatsappAccessToken?: string;
  whatsappBusinessAccountId?: string;
  notifyDaysBeforeExpiry: number;
  notifyOnPaymentReceived: boolean;
  notifyOnMembershipExpiry: boolean;
}

export const useGetIntegrationSettings = () => {
  return useQuery({
    queryKey: ['integrationSettings'],
    queryFn: async () => {
      const { data } = await api.get<IntegrationSettings>('/settings/integrations');
      return data;
    },
  });
};

export const useUpdateRazorpay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { razorpayEnabled: boolean; razorpayKeyId?: string; razorpayKeySecret?: string; razorpayWebhookSecret?: string }) => {
      const { data } = await api.patch('/settings/integrations/razorpay', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrationSettings'] });
    },
  });
};

export const useUpdateWhatsapp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { whatsappEnabled: boolean; whatsappPhoneNumberId?: string; whatsappAccessToken?: string; whatsappBusinessAccountId?: string }) => {
      const { data } = await api.patch('/settings/integrations/whatsapp', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrationSettings'] });
    },
  });
};

export const useUpdateNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { notifyDaysBeforeExpiry: number; notifyOnPaymentReceived: boolean; notifyOnMembershipExpiry: boolean }) => {
      const { data } = await api.patch('/settings/integrations/notifications', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrationSettings'] });
    },
  });
};
