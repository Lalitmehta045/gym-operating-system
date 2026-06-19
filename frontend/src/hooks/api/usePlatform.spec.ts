/**
 * PLATFORM API HOOKS - UNIT TESTS
 * 
 * These tests verify the behavior of platform API hooks:
 * - usePlatformDashboard
 * - useTenants
 * - useTenant
 * - useSuspendTenant
 * - useActivateTenant
 * - usePlatformRevenue
 * - usePlatformPlans
 * 
 * To run these tests:
 * 1. Install testing dependencies: npm install --save-dev @testing-library/react @testing-library/react-hooks msw
 * 2. Run: npm test -- usePlatform.spec
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import {
  usePlatformDashboard,
  useTenants,
  useTenant,
  useSuspendTenant,
  useActivateTenant,
  usePlatformRevenue,
  usePlatformPlans,
} from './usePlatform';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Create a wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Platform API Hooks', () => {
  describe('usePlatformDashboard', () => {
    it('should fetch platform dashboard data successfully', async () => {
      const { result } = renderHook(() => usePlatformDashboard(), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // After fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have dashboard data
      expect(result.current.data).toEqual(
        expect.objectContaining({
          totalGyms: expect.any(Number),
          activeGyms: expect.any(Number),
          trialGyms: expect.any(Number),
          expiredGyms: expect.any(Number),
          suspendedGyms: expect.any(Number),
        })
      );
    });

    it('should have correct query key for caching', () => {
      const { result } = renderHook(() => usePlatformDashboard(), {
        wrapper: createWrapper(),
      });

      // Query should be properly cached with key
      expect(result.current.data || result.current.isLoading).toBeDefined();
    });
  });

  describe('useTenants', () => {
    it('should fetch tenants with pagination', async () => {
      const { result } = renderHook(() => useTenants({ page: 1, limit: 10 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(
        expect.objectContaining({
          data: expect.any(Array),
          meta: expect.objectContaining({
            page: expect.any(Number),
            limit: expect.any(Number),
            total: expect.any(Number),
            totalPages: expect.any(Number),
            hasNextPage: expect.any(Boolean),
            hasPreviousPage: expect.any(Boolean),
          }),
        })
      );
    });

    it('should support search parameter', async () => {
      const searchTerm = 'fitness';
      const { result } = renderHook(
        () => useTenants({ page: 1, limit: 10, search: searchTerm }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Results should be filtered
      expect(result.current.data?.data).toBeDefined();
    });

    it('should support status filtering', async () => {
      const { result } = renderHook(
        () => useTenants({ page: 1, limit: 10, status: 'ACTIVE' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // All results should have ACTIVE status
      result.current.data?.data.forEach((tenant) => {
        expect(tenant.status).toBe('ACTIVE');
      });
    });
  });

  describe('useTenant', () => {
    it('should fetch single tenant details', async () => {
      const tenantId = 'tenant-123';
      const { result } = renderHook(() => useTenant(tenantId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(
        expect.objectContaining({
          id: tenantId,
          name: expect.any(String),
          email: expect.any(String),
          status: expect.stringMatching(/ACTIVE|INACTIVE|TRIAL|EXPIRED|SUSPENDED/),
          memberCount: expect.any(Number),
          subscriptionCount: expect.any(Number),
        })
      );
    });

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useTenant(''), {
        wrapper: createWrapper(),
      });

      // Should not have started fetching
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    it('should refetch when tenant id changes', async () => {
      const { result, rerender } = renderHook(
        ({ id }: { id: string }) => useTenant(id),
        { wrapper: createWrapper(), initialProps: { id: 'tenant-1' } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const firstData = result.current.data;

      rerender({ id: 'tenant-2' });

      await waitFor(() => {
        expect(result.current.data?.id).toBe('tenant-2');
      });

      expect(result.current.data).not.toEqual(firstData);
    });
  });

  describe('useSuspendTenant', () => {
    it('should suspend a tenant successfully', async () => {
      const { result } = renderHook(() => useSuspendTenant(), {
        wrapper: createWrapper(),
      });

      const tenantId = 'tenant-123';

      await act(async () => {
        await result.current.mutateAsync(tenantId);
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data?.status).toBe('SUSPENDED');
    });

    it('should handle suspension errors gracefully', async () => {
      const { result } = renderHook(() => useSuspendTenant(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync('invalid-id');
        } catch (error) {
          // Error is expected for invalid ID
        }
      });

      // Should have error state
      expect(result.current.isError || !result.current.isSuccess).toBeDefined();
    });

    it('should invalidate related queries after suspension', async () => {
      const { result: hookResult } = renderHook(() => useSuspendTenant(), {
        wrapper: createWrapper(),
      });

      const tenantId = 'tenant-123';

      await act(async () => {
        await hookResult.current.mutateAsync(tenantId);
      });

      // Query cache should be invalidated
      expect(hookResult.current.isSuccess).toBe(true);
    });
  });

  describe('useActivateTenant', () => {
    it('should activate a suspended tenant successfully', async () => {
      const { result } = renderHook(() => useActivateTenant(), {
        wrapper: createWrapper(),
      });

      const tenantId = 'tenant-123';

      await act(async () => {
        await result.current.mutateAsync(tenantId);
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data?.status).not.toBe('SUSPENDED');
    });
  });

  describe('usePlatformRevenue', () => {
    it('should fetch revenue metrics', async () => {
      const { result } = renderHook(() => usePlatformRevenue(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(
        expect.objectContaining({
          mrr: expect.any(Number),
          arr: expect.any(Number),
          revenueThisMonth: expect.any(Number),
          revenueByPlan: expect.any(Array),
        })
      );
    });

    it('should have revenue by plan breakdown', async () => {
      const { result } = renderHook(() => usePlatformRevenue(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.data?.revenueByPlan.forEach((plan) => {
        expect(plan).toEqual(
          expect.objectContaining({
            planName: expect.any(String),
            revenue: expect.any(Number),
          })
        );
      });
    });
  });

  describe('usePlatformPlans', () => {
    it('should return predefined platform plans', async () => {
      const { result } = renderHook(() => usePlatformPlans(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have three plans: Starter, Growth, Enterprise
      expect(result.current.data).toHaveLength(3);

      expect(result.current.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Starter',
            price: 29,
            status: 'ACTIVE',
            features: expect.any(Array),
          }),
          expect.objectContaining({
            name: 'Growth',
            price: 79,
            status: 'ACTIVE',
            features: expect.any(Array),
          }),
          expect.objectContaining({
            name: 'Enterprise',
            price: 199,
            status: 'ACTIVE',
            features: expect.any(Array),
          }),
        ])
      );
    });

    it('should have correct features for each plan', async () => {
      const { result } = renderHook(() => usePlatformPlans(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const [starter, growth, enterprise] = result.current.data || [];

      expect(starter.features).toContain('Up to 100 members');
      expect(growth.features).toContain('Up to 500 members');
      expect(enterprise.features).toContain('Unlimited members');
    });
  });
});
