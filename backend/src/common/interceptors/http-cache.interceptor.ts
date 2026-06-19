import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const isHttp = context.getType() === 'http';

    if (!isHttp) {
      return undefined;
    }

    const { httpAdapter } = this.httpAdapterHost;
    const isGetRequest = httpAdapter.getRequestMethod(request) === 'GET';
    const excludePaths: string[] = [
      // Add paths to exclude from auto-caching if needed
    ];

    if (
      !isGetRequest ||
      (isGetRequest && excludePaths.includes(httpAdapter.getRequestUrl(request)))
    ) {
      return undefined;
    }

    // Tenant-aware cache key
    const tenantId = request.user?.tenantId;
    const userId = request.user?.sub;
    const url = httpAdapter.getRequestUrl(request);

    if (tenantId) {
      // If it's a per-user cacheable endpoint, we might want to include userId.
      // For now, let's just include tenantId to ensure basic isolation.
      // We can refine this by checking metadata if we want per-user specificity.
      return `${tenantId}:${url}`;
    }

    return url;
  }
}
