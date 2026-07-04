/**
 * PLATFORM PROTECTED ROUTE - ROLE ACCESS TESTS
 * 
 * These tests ensure that the PlatformProtectedRoute component properly enforces
 * SUPER_ADMIN role authorization for platform routes.
 * 
 * To run these tests:
 * 1. Install testing dependencies: npm install --save-dev @testing-library/react @testing-library/jest-dom jest @types/jest
 * 2. Configure Jest in package.json or jest.config.js
 * 3. Run: npm test -- PlatformProtectedRoute.spec
 */

import { render, screen } from '@testing-library/react';
import { PlatformProtectedRoute } from './PlatformProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('@/hooks/useAuth');
jest.mock('next/navigation');

describe('PlatformProtectedRoute - Authorization Tests', () => {
  const mockRouter = { push: jest.fn() };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('SUPER_ADMIN Access', () => {
    it('should allow SUPER_ADMIN users to access platform routes', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: { role: 'SUPER_ADMIN', email: 'admin@example.com' },
      });

      render(
        <PlatformProtectedRoute>
          <div>Platform Content</div>
        </PlatformProtectedRoute>
      );

      expect(screen.getByText('Platform Content')).toBeInTheDocument();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe('Non-SUPER_ADMIN Access Denial', () => {
    it('should redirect TENANT users to dashboard', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: { role: 'TENANT', email: 'gym@example.com' },
      });

      const { container } = render(
        <PlatformProtectedRoute>
          <div>Platform Content</div>
        </PlatformProtectedRoute>
      );

      // Should show loading state
      expect(container.firstChild?.className).toContain('bg-[var(--canvas-soft)]');
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });

    it('should redirect GYM_OWNER users to dashboard', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: { role: 'GYM_OWNER', email: 'owner@example.com' },
      });

      render(
        <PlatformProtectedRoute>
          <div>Platform Content</div>
        </PlatformProtectedRoute>
      );

      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });

    it('should redirect STAFF users to dashboard', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: { role: 'STAFF', email: 'staff@example.com' },
      });

      render(
        <PlatformProtectedRoute>
          <div>Platform Content</div>
        </PlatformProtectedRoute>
      );

      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Unauthenticated Access Denial', () => {
    it('should redirect unauthenticated users to login', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      render(
        <PlatformProtectedRoute>
          <div>Platform Content</div>
        </PlatformProtectedRoute>
      );

      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });

    it('should show loading state on mount', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      const { container } = render(
        <PlatformProtectedRoute>
          <div>Platform Content</div>
        </PlatformProtectedRoute>
      );

      // Verify loading state is shown before redirect
      expect(container.firstChild?.className).toContain('bg-[var(--canvas-soft)]');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null user object gracefully', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: null,
      });

      render(
        <PlatformProtectedRoute>
          <div>Platform Content</div>
        </PlatformProtectedRoute>
      );

      expect(mockRouter.push).toHaveBeenCalled();
    });

    it('should handle mounting state correctly', () => {
      const { rerender } = render(
        <PlatformProtectedRoute>
          <div>Platform Content</div>
        </PlatformProtectedRoute>
      );

      // Should return null on initial mount to avoid hydration mismatch
      expect(screen.queryByText('Platform Content')).not.toBeInTheDocument();

      // After mount, should show loading state
      rerender(
        <PlatformProtectedRoute>
          <div>Platform Content</div>
        </PlatformProtectedRoute>
      );
    });
  });
});
