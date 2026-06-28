import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '../../../generated/prisma/client.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain corner cases, the httpAdapterHost might not be available
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          httpStatus = HttpStatus.CONFLICT;
          break;
        case 'P2025':
          httpStatus = HttpStatus.NOT_FOUND;
          break;
        default:
          httpStatus = HttpStatus.BAD_REQUEST;
      }
    }

    const isProduction = process.env.NODE_ENV === 'production';

    // Log the error for internal tracking
    const message =
      exception instanceof Error ? exception.message : 'Unknown exception';
    const stack = exception instanceof Error ? exception.stack : '';

    if (httpStatus >= 500) {
      this.logger.error(`Status: ${httpStatus} | Error: ${message}`, stack);
    } else {
      this.logger.warn(`Status: ${httpStatus} | Message: ${message}`);
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      // Sanitized message for the client
      message: this.getSafeMessage(exception, httpStatus, isProduction),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private getSafeMessage(
    exception: unknown,
    status: number,
    isProduction: boolean,
  ): string | object {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      // If it's a validation error or specifically crafted HttpException, we might want to pass it through
      // But only if it's not a 500 error or we are in development
      if (status < 500 || !isProduction) {
        return typeof response === 'object' && (response as any).message
          ? (response as any).message
          : response;
      }
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (status === 409) return 'This record already exists or conflicts with another.';
      if (status === 404) return 'Requested resource was not found.';
      if (!isProduction) return exception.message;
      return 'Database operation failed.';
    }

    return isProduction
      ? 'Internal server error'
      : (exception as any)?.message || 'Internal server error';
  }
}
