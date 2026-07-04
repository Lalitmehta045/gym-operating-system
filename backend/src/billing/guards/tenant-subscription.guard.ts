import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Role, TenantStatus } from '../../../generated/prisma/client.js';

@Injectable()
export class TenantSubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const skipSubscription = this.reflector.getAllAndOverride<boolean>(
      'skipSubscription',
      [context.getHandler(), context.getClass()],
    );
    if (skipSubscription) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role === Role.SUPER_ADMIN || !user.tenantId) {
      return true;
    }

    const cacheKey = `tenant-sub-guard:${user.tenantId}`;
    let cachedStatus = await this.cacheManager.get<TenantStatus | null>(cacheKey);

    if (cachedStatus === undefined || cachedStatus === null) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: { status: true },
      });

      if (tenant) {
        cachedStatus = tenant.status;
        await this.cacheManager.set(cacheKey, cachedStatus, 60000);
      } else {
        return true;
      }
    }

    if (cachedStatus === TenantStatus.EXPIRED) {
      throw new ForbiddenException(
        'Tenant subscription expired. Please renew.',
      );
    }

    return true;
  }
}
