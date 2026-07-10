import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Member } from './useMembers';

// Interfaces
export interface Attendance {
  id: string;
  tenantId: string;
  memberId: string;
  markedByUserId?: string;
  checkInAt: string;
  checkOutAt?: string;
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'MISSED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  memberName?: string;
  member?: Member;
  markedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface AttendancesResponse {
  data: Attendance[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetAttendancesParams {
  page?: number;
  limit?: number;
  status?: string;
  memberId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DailyAttendanceReport {
  presentCount: number;
  absentCount: number;
  lateCount: number;
  missedCount: number;
  attendanceRate: number;
  date: string;
}

export interface MemberAttendanceStats {
  attendancePercentage: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalMissed: number;
  totalDays: number;
}

export interface CheckInDto {
  memberId: string;
}

export interface CheckOutDto {
  notes?: string;
}

export interface ManualAttendanceDto {
  memberId: string;
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'MISSED';
  notes?: string;
}

// Hooks
export const useAttendances = (params?: GetAttendancesParams) => {
  return useQuery({
    queryKey: ['attendances', params],
    queryFn: async () => {
      const filteredParams = params
        ? Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== "" && v !== undefined)
          )
        : {};
      const { data } = await api.get<AttendancesResponse>('/attendances', { params: filteredParams });
      return data;
    },
  });
};

export const useAttendance = (id: string) => {
  return useQuery({
    queryKey: ['attendances', id],
    queryFn: async () => {
      const { data } = await api.get<Attendance>(`/attendances/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CheckInDto) => {
      const { data } = await api.post<Attendance>('/attendances/check-in', dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['attendanceReports'] });
    },
  });
};

export const useScanQr = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (qrToken: string) => {
      const { data } = await api.post<Attendance>('/attendances/scan', { qrToken });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['attendanceReports'] });
    },
  });
};

export const useCheckOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data } = await api.post<Attendance>('/attendances/check-out', { attendanceId: id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
    },
  });
};

export const useManualAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: ManualAttendanceDto) => {
      const { data } = await api.post<Attendance>('/attendances/manual', dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['attendanceReports'] });
    },
  });
};

export const useAttendanceReportsDaily = (date?: string) => {
  return useQuery({
    queryKey: ['attendanceReports', 'daily', date],
    queryFn: async () => {
      const { data } = await api.get<DailyAttendanceReport>('/attendances/reports/daily', {
        params: { date },
      });
      return data;
    },
  });
};

export const useMemberAttendance = (memberId: string) => {
  return useQuery({
    queryKey: ['attendances', 'member', memberId],
    queryFn: async () => {
      const { data } = await api.get<MemberAttendanceStats>(`/attendances/reports/member/${memberId}`);
      return data;
    },
    enabled: !!memberId,
  });
};
