import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

// Interfaces
export interface RevenueReport {
  totalRevenue: number;
  byMethod: {
    CASH: number;
    UPI: number;
    CARD: number;
    BANK_TRANSFER: number;
  };
  byStatus: {
    PENDING: number;
    PAID: number;
    FAILED: number;
    REFUNDED: number;
  };
}

export interface GetRevenueReportParams {
  startDate?: string;
  endDate?: string;
}

// Hooks
export const useRevenueReport = (params?: GetRevenueReportParams) => {
  return useQuery({
    queryKey: ['reports', 'revenue', params],
    queryFn: async () => {
      const { data } = await api.get<RevenueReport>('/reports/revenue', { params });
      return data;
    },
  });
};
