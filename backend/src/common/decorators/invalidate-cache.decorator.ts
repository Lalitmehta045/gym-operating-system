import { SetMetadata } from '@nestjs/common';

export const INVALIDATE_CACHE_KEY = 'invalidate_cache';

/**
 * Decorator to specify which cache keys should be invalidated after a successful write operation.
 * Supports patterns with :tenantId placeholder.
 * 
 * Example: @InvalidateCache([':tenantId:/api/v1/members*', ':tenantId:/api/v1/dashboard/*'])
 */
export const InvalidateCache = (patterns: string[]) => SetMetadata(INVALIDATE_CACHE_KEY, patterns);
