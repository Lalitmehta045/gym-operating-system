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

  constructor() {
    this.slowThreshold = parseInt(
      process.env.SLOW_REQUEST_THRESHOLD ?? '500',
      10,
    );
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url: rawUrl } = request;
    // Strip query string so grouping by endpoint is clean
    const url = rawUrl.split('?')[0];
    const start = performance.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const duration = Math.round(performance.now() - start);

          this.logger.log(`${method} ${url} ${statusCode} ${duration}ms`);

          if (duration >= this.slowThreshold) {
            this.logger.warn(
              `SLOW ${method} ${url} ${statusCode} ${duration}ms`,
            );
          }
        },
        error: (error) => {
          const duration = Math.round(performance.now() - start);
          const statusCode = error.status ?? 500;

          this.logger.error(`${method} ${url} ${statusCode} ${duration}ms`);
        },
      }),
    );
  }
}
