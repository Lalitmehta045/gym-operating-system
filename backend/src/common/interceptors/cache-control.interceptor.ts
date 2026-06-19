import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  CACHE_CONTROL_KEY,
  CacheControlOptions,
  CACHE_PRESETS,
} from '../decorators/cache-control.decorator.js';

@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Determine default based on authentication
    // If route is public, maybe allow some caching. If authenticated, default to private.
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler()) || 
                    this.reflector.get<boolean>('isPublic', context.getClass());

    let cacheHeader = isPublic ? CACHE_PRESETS.PUBLIC_API : CACHE_PRESETS.PRIVATE;

    // Check for explicit decorator override
    const options = this.reflector.getAllAndOverride<CacheControlOptions>(
      CACHE_CONTROL_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (options) {
      cacheHeader = options.value;
    }

    // Only apply for GET requests
    if (request.method === 'GET') {
      return next.handle().pipe(
        tap(() => {
          response.setHeader('Cache-Control', cacheHeader);
        }),
      );
    }

    // For non-GET requests, ensure no-store
    return next.handle().pipe(
      tap(() => {
        response.setHeader('Cache-Control', CACHE_PRESETS.REALTIME);
      }),
    );
  }
}
