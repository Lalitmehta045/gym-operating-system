import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface.js';

/**
 * Parameter decorator to extract the tenantId from the authenticated user in the request.
 */
export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    if (!user || !user.tenantId) {
      throw new UnauthorizedException('Tenant-scoped access is required');
    }

    return user.tenantId;
  },
);
