// ============================================================================
// TenantProfileService - Phase 2B tenant profile business logic
// ============================================================================

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TenantProfileDto } from '../dto/tenant-profile.dto.js';
import { UpdateTenantProfileDto } from '../dto/update-tenant-profile.dto.js';
import { TenantProfileServiceInterface } from '../interfaces/tenant-profile-service.interface.js';

@Injectable()
export class TenantProfileService implements TenantProfileServiceInterface {
  constructor(private readonly prisma: PrismaService) {}

  async getTenantProfile(tenantId: string): Promise<TenantProfileDto> {
    this.assertTenantScope(tenantId);

    const tenant = await this.prisma.tenant.findFirst({
      where: {
        id: tenantId,
        deletedAt: null,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant profile not found');
    }

    return this.toDto(tenant);
  }

  async updateTenantProfile(
    tenantId: string,
    dto: UpdateTenantProfileDto,
  ): Promise<TenantProfileDto> {
    this.assertTenantScope(tenantId);

    const existingTenant = await this.prisma.tenant.findFirst({
      where: {
        id: tenantId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!existingTenant) {
      throw new NotFoundException('Tenant profile not found');
    }

    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.gymLogoUrl !== undefined && { gymLogoUrl: dto.gymLogoUrl }),
        ...(dto.gymDescription !== undefined && {
          gymDescription: dto.gymDescription,
        }),
        ...(dto.gymWebsite !== undefined && {
          gymWebsite: dto.gymWebsite,
        }),
        ...(dto.gstNumber !== undefined && { gstNumber: dto.gstNumber }),
        ...(dto.timezone !== undefined && { timezone: dto.timezone }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.businessHours !== undefined && {
          businessHours: dto.businessHours as unknown as Prisma.InputJsonValue,
        }),
      },
    });

    return this.toDto(tenant);
  }

  private assertTenantScope(
    tenantId: string | null | undefined,
  ): asserts tenantId is string {
    if (!tenantId) {
      throw new ForbiddenException('Tenant-scoped access is required');
    }
  }

  private toDto(tenant: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    country: string | null;
    state: string | null;
    city: string | null;
    gymLogoUrl: string | null;
    gymDescription: string | null;
    gymWebsite: string | null;
    gstNumber: string | null;
    timezone: string;
    currency: string;
    businessHours: unknown;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): TenantProfileDto {
    return {
      id: tenant.id,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      address: tenant.address,
      country: tenant.country,
      state: tenant.state,
      city: tenant.city,
      gymLogoUrl: tenant.gymLogoUrl,
      gymDescription: tenant.gymDescription,
      gymWebsite: tenant.gymWebsite,
      gstNumber: tenant.gstNumber,
      timezone: tenant.timezone,
      currency: tenant.currency,
      businessHours: tenant.businessHours as TenantProfileDto['businessHours'],
      isActive: tenant.isActive,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }
}
