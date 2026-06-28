import api from '@/lib/axios';

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  memberId?: string | null;
  entity: string;
  entityId: string;
  action: string;
  description: string;
  metadata?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  meta: {
    total: number;
    skip: number;
    take: number;
  };
}

export interface AuditLogFilters {
  entity?: string;
  action?: string;
  userId?: string;
  memberId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  skip?: number;
  take?: number;
}

export const auditService = {
  getLogs: async (filters: AuditLogFilters = {}): Promise<PaginatedAuditLogs> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await api.get(`/audit?${params.toString()}`);
    return response.data;
  },

  getPlatformLogs: async (filters: AuditLogFilters = {}): Promise<PaginatedAuditLogs> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await api.get(`/audit/platform?${params.toString()}`);
    return response.data;
  },

  getMemberTimeline: async (memberId: string, skip = 0, take = 20): Promise<PaginatedAuditLogs> => {
    const response = await api.get(`/audit/member/${memberId}?skip=${skip}&take=${take}`);
    return response.data;
  },

  getUserHistory: async (userId: string, skip = 0, take = 20): Promise<PaginatedAuditLogs> => {
    const response = await api.get(`/audit/user/${userId}?skip=${skip}&take=${take}`);
    return response.data;
  },
};
