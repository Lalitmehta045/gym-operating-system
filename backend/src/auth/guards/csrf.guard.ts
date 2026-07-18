import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Skip CSRF check for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    // Skip CSRF check for public auth endpoints (login, register, refresh)
    // These use HttpOnly cookies with sameSite: strict which provides CSRF protection
    const path = request.path;
    const publicAuthEndpoints = [
      '/api/v1/auth/login',
      '/api/v1/auth/register',
      '/api/v1/auth/refresh',
      '/api/v1/auth/forgot-password',
      '/api/v1/auth/reset-password',
      '/api/v1/webhooks/razorpay',
      '/webhooks/razorpay',
    ];

    if (publicAuthEndpoints.includes(path)) {
      return true;
    }

    // For other state-changing requests, validate CSRF token
    const csrfToken = request.headers['x-csrf-token'] as string;
    const csrfCookie = request.cookies?.['csrfToken'];

    if (!csrfToken || !csrfCookie) {
      throw new BadRequestException('CSRF token missing');
    }

    // Validate that token matches cookie
    if (csrfToken !== csrfCookie) {
      throw new BadRequestException('Invalid CSRF token');
    }

    return true;
  }
}
