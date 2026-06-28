import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface StorageMetrics {
  usedStorageBytes: number;
  storageLimitBytes: number;
  totalFiles: number;
  totalImages: number;
  totalDocuments: number;
  lastCalculatedAt: string;
}

export interface StorageUsageHistory {
  history: { month: string; usedMB: number }[];
  current: number;
  limit: number;
}

export interface PlatformStorage {
  totalUsed: number;
  totalLimit: number;
  totalFiles: number;
  tenants: {
    tenantId: string;
    tenantName: string;
    planName: string;
    usedBytes: number;
    limitBytes: number;
    usagePercent: string;
    fileCount: number;
  }[];
}

export const useCurrentStorage = () => {
  return useQuery({
    queryKey: ['storage', 'current'],
    queryFn: async (): Promise<StorageMetrics> => {
      const response = await api.get('/storage/current');
      return response.data;
    },
  });
};

export const useStorageUsage = () => {
  return useQuery({
    queryKey: ['storage', 'usage'],
    queryFn: async (): Promise<StorageUsageHistory> => {
      const response = await api.get('/storage/usage');
      return response.data;
    },
  });
};

export const usePlatformStorage = () => {
  return useQuery({
    queryKey: ['platform', 'storage'],
    queryFn: async (): Promise<PlatformStorage> => {
      const response = await api.get('/platform/storage');
      return response.data;
    },
  });
};
