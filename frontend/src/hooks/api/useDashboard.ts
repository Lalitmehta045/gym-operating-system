import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/axios';

// Interfaces based on backend DTOs
export interface DashboardOverview {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  suspendedMembers: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  todayAttendance: number;
  monthlyAttendanceRate: number;
  totalRevenue: number;
  monthlyRevenue: number;
  expiringMemberships: number;
}

export interface DashboardMembers {
  totalMembers: number;
  newMembersThisMonth: number;
  activeMembers: number;
  inactiveMembers: number;
  suspendedMembers: number;
  dailyGrowth: { date: string; count: number }[];
  weeklyGrowth: { week: string; count: number }[];
  monthlyGrowth: { month: string; count: number }[];
}

export interface DashboardAttendance {
  todayPresent: number;
  todayAbsent: number;
  todayLate: number;
  todayMissed: number;
  attendanceRate: number;
  monthlyAttendanceTrend: { date: string; count: number }[];
  hourlyData: { time: string; checkIns: number; checkOuts: number }[];
  planData: { name: string; value: number; color: string }[];
  totalCheckInsThisMonth: number;
  growthPercentage: number;
}

export interface DashboardRevenue {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  revenueByMethod: {
    CASH: number;
    UPI: number;
    CARD: number;
    BANK_TRANSFER: number;
  };
  revenueTrend?: { date: string; revenue: number }[];
}

export interface DashboardSubscriptions {
  activeSubscriptions: number;
  expiredSubscriptions: number;
  cancelledSubscriptions: number;
  pendingSubscriptions: number;
  renewalsThisMonth: number;
  expiringNext7Days: number;
  expiringNext15Days: number;
  expiringNext30Days: number;
}

export interface DashboardTopMember {
  memberId: string;
  memberName: string;
  attendancePercentage: number;
}

const fetchWithRetry = async (url: string, signal?: AbortSignal) => {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await api.get(url, { signal });
      // Backend now returns { data: null, restricted: true } for unauthorized roles
      // on certain endpoints, but we also handle hard 403s just in case.
      if (res.data?.restricted) return null;
      return res.data;
    } catch (error: any) {
      if (error.response?.status === 403) return null;
      if (error.response?.status !== 429) throw error;
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
};

export const useDashboardOverview = (query?: { dateFrom?: string; dateTo?: string }) => {
  return useQuery({
    queryKey: ['dashboard', 'overview', query?.dateFrom, query?.dateTo],
    queryFn: async ({ signal }) => {
      // Group 1: fire immediately
      const params = new URLSearchParams()
      if (query?.dateFrom) params.append('dateFrom', query.dateFrom)
      if (query?.dateTo) params.append('dateTo', query.dateTo)
      const queryString = params.toString() ? `?${params.toString()}` : ''
      return fetchWithRetry(`/dashboard/overview${queryString}`, signal) as Promise<DashboardOverview>;
    },
    placeholderData: keepPreviousData,
  });
};

export const useDashboardMembers = (query?: { dateFrom?: string; dateTo?: string }) => {
  return useQuery({
    queryKey: ['dashboard', 'members', query?.dateFrom, query?.dateTo],
    queryFn: async ({ signal }) => {
      await new Promise(r => setTimeout(r, 150));
      const params = new URLSearchParams()
      if (query?.dateFrom) params.append('dateFrom', query.dateFrom)
      if (query?.dateTo) params.append('dateTo', query.dateTo)
      const queryString = params.toString() ? `?${params.toString()}` : ''
      return fetchWithRetry(`/dashboard/members${queryString}`, signal) as Promise<DashboardMembers>;
    },
    placeholderData: keepPreviousData,
  });
};

export const useDashboardAttendance = (query?: { dateFrom?: string; dateTo?: string }) => {
  return useQuery({
    queryKey: ['dashboard', 'attendance', query?.dateFrom, query?.dateTo],
    queryFn: async ({ signal }) => {
      // Group 1: fire immediately
      const params = new URLSearchParams()
      if (query?.dateFrom) params.append('dateFrom', query.dateFrom)
      if (query?.dateTo) params.append('dateTo', query.dateTo)
      const queryString = params.toString() ? `?${params.toString()}` : ''
      return fetchWithRetry(`/dashboard/attendance${queryString}`, signal) as Promise<DashboardAttendance>;
    },
    placeholderData: keepPreviousData,
  });
};

export const useDashboardRevenue = (query?: { dateFrom?: string; dateTo?: string }) => {
  return useQuery({
    queryKey: ['dashboard', 'revenue', query?.dateFrom, query?.dateTo],
    queryFn: async ({ signal }) => {
      await new Promise(r => setTimeout(r, 150));
      const params = new URLSearchParams()
      if (query?.dateFrom) params.append('dateFrom', query.dateFrom)
      if (query?.dateTo) params.append('dateTo', query.dateTo)
      const queryString = params.toString() ? `?${params.toString()}` : ''
      return fetchWithRetry(`/dashboard/revenue${queryString}`, signal) as Promise<DashboardRevenue>;
    },
    placeholderData: keepPreviousData,
  });
};

export const useDashboardSubscriptions = (query?: { dateFrom?: string; dateTo?: string }) => {
  return useQuery({
    queryKey: ['dashboard', 'subscriptions', query?.dateFrom, query?.dateTo],
    queryFn: async ({ signal }) => {
      await new Promise(r => setTimeout(r, 300));
      const params = new URLSearchParams()
      if (query?.dateFrom) params.append('dateFrom', query.dateFrom)
      if (query?.dateTo) params.append('dateTo', query.dateTo)
      const queryString = params.toString() ? `?${params.toString()}` : ''
      return fetchWithRetry(`/dashboard/subscriptions${queryString}`, signal) as Promise<DashboardSubscriptions>;
    },
    placeholderData: keepPreviousData,
  });
};

export const useDashboardTopMembers = (query?: { dateFrom?: string; dateTo?: string }) => {
  return useQuery({
    queryKey: ['dashboard', 'top-members', query?.dateFrom, query?.dateTo],
    queryFn: async ({ signal }) => {
      await new Promise(r => setTimeout(r, 300));
      const params = new URLSearchParams()
      if (query?.dateFrom) params.append('dateFrom', query.dateFrom)
      if (query?.dateTo) params.append('dateTo', query.dateTo)
      const queryString = params.toString() ? `?${params.toString()}` : ''
      return fetchWithRetry(`/dashboard/top-members${queryString}`, signal) as Promise<DashboardTopMember[]>;
    },
    placeholderData: keepPreviousData,
  });
};
