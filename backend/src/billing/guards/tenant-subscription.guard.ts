import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Role, TenantStatus } from '../../../generated/prisma/client.js';

@Injectable()
export class TenantSubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const skipSubscription = this.reflector.getAllAndOverride<boolean>('skipSubscription', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipSubscription) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role === Role.SUPER_ADMIN || !user.tenantId) {
      return true;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { status: true },
    });

    if (!tenant) return true;

    if (tenant.status === TenantStatus.EXPIRED) {
      throw new ForbiddenException('Tenant subscription expired. Please renew.');
    }

    return true;
  }
}
