import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface DashboardAnalyticsResponse {
  financials: {
    revenue: number;
    collection: number;
    invoiceCounts: {
      totalInvoices: number;
      paidInvoices: number;
      pendingInvoices: number;
    };
  };
  memberships: {
    status: string;
    _count: number;
  }[];
  attendance: {
    today: number;
  };
  renewals: {
    upcoming: number;
  };
  plans: {
    planName: string;
    count: number;
  }[];
  staff: {
    assignedTrainerId: string;
    _count: number;
  }[];
}

export const useDashboardAnalytics = () => {
  return useQuery<DashboardAnalyticsResponse>({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get<DashboardAnalyticsResponse>('/reports/dashboard');
      return data;
    },
  });
};

export const downloadPdfReport = (type: string = 'dashboard') => {
  // Download file via authenticated api
  return api.get(`/reports/export/pdf?type=${type}`, { responseType: 'blob' }).then(response => {
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report-${type}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  });
};
