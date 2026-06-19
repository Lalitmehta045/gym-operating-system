import { SetMetadata } from '@nestjs/common';

export const CACHE_CONTROL_KEY = 'cache_control';

export interface CacheControlOptions {
  value: string;
}

/**
 * Decorator to set the Cache-Control header for a response.
 */
export const CacheControl = (value: string) =>
  SetMetadata(CACHE_CONTROL_KEY, { value });

// Common preset constants
export const CACHE_PRESETS = {
  PUBLIC_STATIC: 'public, max-age=31536000, immutable',
  PUBLIC_API: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=60',
  PRIVATE: 'private, no-cache, no-store, must-revalidate',
  REALTIME: 'no-store, max-age=0',
};
