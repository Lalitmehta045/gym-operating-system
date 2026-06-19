import { useQuery } from '@tanstack/react-query';
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

// Hooks

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const { data } = await api.get<DashboardOverview>('/dashboard/overview');
      return data;
    },
  });
};

export const useDashboardMembers = () => {
  return useQuery({
    queryKey: ['dashboard', 'members'],
    queryFn: async () => {
      const { data } = await api.get<DashboardMembers>('/dashboard/members');
      return data;
    },
  });
};

export const useDashboardAttendance = () => {
  return useQuery({
    queryKey: ['dashboard', 'attendance'],
    queryFn: async () => {
      const { data } = await api.get<DashboardAttendance>('/dashboard/attendance');
      return data;
    },
  });
};

export const useDashboardRevenue = () => {
  return useQuery({
    queryKey: ['dashboard', 'revenue'],
    queryFn: async () => {
      const { data } = await api.get<DashboardRevenue>('/dashboard/revenue');
      return data;
    },
  });
};

export const useDashboardSubscriptions = () => {
  return useQuery({
    queryKey: ['dashboard', 'subscriptions'],
    queryFn: async () => {
      const { data } = await api.get<DashboardSubscriptions>('/dashboard/subscriptions');
      return data;
    },
  });
};

export const useDashboardTopMembers = () => {
  return useQuery({
    queryKey: ['dashboard', 'top-members'],
    queryFn: async () => {
      const { data } = await api.get<DashboardTopMember[]>('/dashboard/top-members');
      return data;
    },
  });
};
