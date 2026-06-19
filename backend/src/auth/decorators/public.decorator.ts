// ============================================================================
// @Public() — Marks a route as publicly accessible (bypasses JWT guard)
// ============================================================================

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark a route handler as public.
 * Routes decorated with @Public() will bypass the global JwtAuthGuard.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
