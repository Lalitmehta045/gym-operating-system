import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getFilter = useCallback((key: string) => {
    return searchParams.get(key) || '';
  }, [searchParams]);

  const setFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Always reset page to 1 when filters change (except when changing page itself)
    if (key !== 'page') {
      params.delete('page'); 
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const setFilters = useCallback((updates: Record<string, string | undefined | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (params.get(key) !== value) {
          params.set(key, value);
          changed = true;
        }
      } else {
        if (params.has(key)) {
          params.delete(key);
          changed = true;
        }
      }
    });

    if (changed) {
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [searchParams, pathname, router]);

  const clearFilters = useCallback((keysToKeep: string[] = []) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Convert to array of keys before iterating to avoid mutation issues
    const keys = Array.from(params.keys());
    
    let changed = false;
    keys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        params.delete(key);
        changed = true;
      }
    });

    if (changed) {
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [searchParams, pathname, router]);

  return {
    searchParams,
    getFilter,
    setFilter,
    setFilters,
    clearFilters
  };
}
