import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TenantSubscriptionService } from '../../tenant-subscription/services/tenant-subscription.service.js';

@Injectable()
export class SuperadminService {
  constructor(
    private prisma: PrismaService,
    private tenantSubscriptionService: TenantSubscriptionService
  ) {}

  async getPendingTenants() {
    return this.prisma.tenant.findMany({
      where: {
        status: 'PENDING',
        deletedAt: null,
      },
      include: {
        users: {
          where: { role: 'OWNER' },
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const updatedTenantResult = await this.prisma.$transaction(async (tx) => {
      const updatedTenant = await tx.tenant.update({
        where: { id: tenantId },
        data: { status: 'TRIAL', isActive: true },
      });

      await tx.user.updateMany({
        where: { tenantId, role: 'OWNER' },
        data: { isActive: true },
      });

      return updatedTenant;
    });

    await this.tenantSubscriptionService.createTrialSubscription(tenantId);

    return updatedTenantResult;
  }

  async rejectTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    // Soft delete or completely remove depending on logic.
    // We will hard delete for rejected applications to keep DB clean.
    await this.prisma.tenant.delete({
      where: { id: tenantId },
    });

    return { message: 'Tenant application rejected and deleted' };
  }
}
