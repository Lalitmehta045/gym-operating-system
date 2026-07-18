import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { INVALIDATE_CACHE_KEY } from '../decorators/invalidate-cache.decorator.js';

@Injectable()
export class CacheInvalidationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInvalidationInterceptor.name);

  constructor(
    private reflector: Reflector,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const patterns = this.reflector.getAllAndOverride<string[]>(
      INVALIDATE_CACHE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!patterns || patterns.length === 0) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;

    return next.handle().pipe(
      switchMap(async (data) => {
        // Only invalidate on successful responses (2xx)
        const response = context.switchToHttp().getResponse();
        if (response.statusCode >= 200 && response.statusCode < 300) {
          await this.invalidatePatterns(patterns, tenantId);
        }
        return data;
      }),
    );
  }

  private async invalidatePatterns(patterns: string[], tenantId?: string) {
    // In cache-manager v5+, use keys() directly on the cacheManager if available.
    // For many stores, you might need to iterate through keys.
    // Note: Memory store in v5+ might not expose keys() directly depending on configuration.

    // We try to get keys from the store. In v5, it's often accessible via cacheManager.
    // However, the types for v5/v6 are notoriously difficult.

    try {
      // Try to get keys. This works for many stores including memory-cache-v5
      // and cache-manager v7+ (Keyv).
      let keys: string[] = [];
      const anyCache = this.cacheManager as any;
      
      if (anyCache.stores && Array.isArray(anyCache.stores) && anyCache.stores[0] && typeof anyCache.stores[0].iterator === 'function') {
        // cache-manager v7+ (Keyv)
        const keyv = anyCache.stores[0];
        for await (const [key] of keyv.iterator()) {
          keys.push(key);
        }
      } else if (typeof anyCache.store?.keys === 'function') {
        // cache-manager v5 (some stores)
        keys = await anyCache.store.keys();
      } else if (typeof anyCache.keys === 'function') {
        // cache-manager v4 or below
        keys = await anyCache.keys();
      }

      if (!keys || !Array.isArray(keys)) return;

      for (const pattern of patterns) {
        const resolvedPattern = tenantId
          ? pattern.replace(':tenantId', tenantId)
          : pattern.replace(':tenantId:', '');

        const regex = new RegExp(
          '^' + resolvedPattern.replace(/\*/g, '.*') + '$',
        );

        const keysToDelete = keys.filter(
          (key) => typeof key === 'string' && regex.test(key),
        );

        if (keysToDelete.length > 0) {
          await Promise.all(
            keysToDelete.map((key) => this.cacheManager.del(key)),
          );
        }
      }
    } catch (err) {
      this.logger.warn(
        'Cache invalidation failed: keys() might not be supported by the store.',
        err,
      );
    }
  }
}
