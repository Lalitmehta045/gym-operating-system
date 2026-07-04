import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly slowThreshold: number;
  private readonly logAllRequests: boolean;

  constructor() {
    this.slowThreshold = parseInt(
      process.env.PERFORMANCE_SLOW_REQUEST_MS ??
        process.env.SLOW_REQUEST_THRESHOLD ??
        '1000',
      10,
    );
    this.logAllRequests =
      process.env.PERFORMANCE_LOG_ALL_REQUESTS === 'true' ||
      process.env.NODE_ENV !== 'production';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url: rawUrl } = request;
    // Strip query string so grouping by endpoint is clean
    const url = rawUrl.split('?')[0];
    const requestId =
      request.headers?.['x-request-id'] ||
      request.headers?.['x-correlation-id'] ||
      request.id ||
      'unknown';
    const tenantId = request.user?.tenantId ?? 'none';
    const userId = request.user?.sub ?? request.user?.id ?? 'anonymous';
    const start = performance.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const duration = Math.round(performance.now() - start);
          const contextLog = `requestId=${requestId} method=${method} route=${url} status=${statusCode} durationMs=${duration} tenantId=${tenantId} userId=${userId}`;

          if (this.logAllRequests) {
            this.logger.log(contextLog);
          }

          if (duration >= this.slowThreshold) {
            this.logger.warn(`SLOW_REQUEST ${contextLog}`);
          }
        },
        error: (error) => {
          const duration = Math.round(performance.now() - start);
          const statusCode = error.status ?? 500;

          this.logger.error(
            `requestId=${requestId} method=${method} route=${url} status=${statusCode} durationMs=${duration} tenantId=${tenantId} userId=${userId}`,
          );
        },
      }),
    );
  }
}
