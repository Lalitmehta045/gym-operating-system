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
import * as fs from 'fs';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
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
    const message = exception instanceof Error ? exception.message : 'Unknown exception';
    const stack = exception instanceof Error ? exception.stack : '';

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: this.getSafeMessage(exception, httpStatus, isProduction),
      rawError: exception instanceof Error ? exception.message : String(exception),
      errorResponse: exception instanceof HttpException ? exception.getResponse() : null
    };

    // LOG TO FILE FOR DEBUGGING
    fs.appendFileSync('c:\\Users\\HP-PC\\OneDrive\\Desktop\\Gym Operating System\\backend\\error-log.txt', JSON.stringify(responseBody, null, 2) + '\n');

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private getSafeMessage(exception: unknown, status: number, isProduction: boolean): string | object {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
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
    return isProduction ? 'Internal server error' : (exception as any)?.message || 'Internal server error';
  }
}
