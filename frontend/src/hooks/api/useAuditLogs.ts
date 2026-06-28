import { useState, useEffect } from 'react';
import { auditService, AuditLogFilters, PaginatedAuditLogs } from '@/services/audit.service';

export function useAuditLogs(filters: AuditLogFilters = {}) {
  const [data, setData] = useState<PaginatedAuditLogs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const response = await auditService.getLogs(filters);
        if (isMounted) {
          setData(response);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchLogs();
    return () => { isMounted = false; };
  }, [JSON.stringify(filters)]);

  return { data, isLoading, isError: !!error, error };
}

export function useMemberTimeline(memberId: string, skip = 0, take = 20) {
  const [data, setData] = useState<PaginatedAuditLogs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!memberId) return;
    const fetchTimeline = async () => {
      setIsLoading(true);
      try {
        const response = await auditService.getMemberTimeline(memberId, skip, take);
        if (isMounted) {
          setData(response);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchTimeline();
    return () => { isMounted = false; };
  }, [memberId, skip, take]);

  return { data, isLoading, isError: !!error, error };
}

export function useUserHistory(userId: string, skip = 0, take = 20) {
  const [data, setData] = useState<PaginatedAuditLogs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!userId) return;
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await auditService.getUserHistory(userId, skip, take);
        if (isMounted) {
          setData(response);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchHistory();
    return () => { isMounted = false; };
  }, [userId, skip, take]);

  return { data, isLoading, isError: !!error, error };
}

export function usePlatformLogs(filters: AuditLogFilters = {}) {
  const [data, setData] = useState<PaginatedAuditLogs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const response = await auditService.getPlatformLogs(filters);
        if (isMounted) {
          setData(response);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchLogs();
    return () => { isMounted = false; };
  }, [JSON.stringify(filters)]);

  return { data, isLoading, isError: !!error, error };
}
