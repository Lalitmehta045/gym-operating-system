import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { INVALIDATE_CACHE_KEY } from '../decorators/invalidate-cache.decorator.js';

@Injectable()
export class CacheInvalidationInterceptor implements NestInterceptor {
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
      tap(async () => {
        // Only invalidate on successful responses (2xx)
        const response = context.switchToHttp().getResponse();
        if (response.statusCode >= 200 && response.statusCode < 300) {
          await this.invalidatePatterns(patterns, tenantId);
        }
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
      const keys = await (this.cacheManager as any).store.keys();
      
      if (!keys || !Array.isArray(keys)) return;

      for (const pattern of patterns) {
        const resolvedPattern = tenantId 
          ? pattern.replace(':tenantId', tenantId)
          : pattern.replace(':tenantId:', '');

        const regex = new RegExp('^' + resolvedPattern.replace(/\*/g, '.*') + '$');
        
        const keysToDelete = keys.filter(key => typeof key === 'string' && regex.test(key));
        
        if (keysToDelete.length > 0) {
          await Promise.all(keysToDelete.map(key => this.cacheManager.del(key)));
        }
      }
    } catch (err) {
      console.warn('Cache invalidation failed: keys() might not be supported by the store.', err);
    }
  }
}
