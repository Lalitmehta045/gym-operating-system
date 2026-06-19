// ============================================================================
// TenantProfileServiceInterface - Phase 2A service boundary
// ============================================================================

import { TenantProfileDto } from '../dto/tenant-profile.dto.js';
import { UpdateTenantProfileDto } from '../dto/update-tenant-profile.dto.js';

export interface TenantProfileServiceInterface {
  getTenantProfile(tenantId: string): Promise<TenantProfileDto>;
  updateTenantProfile(
    tenantId: string,
    dto: UpdateTenantProfileDto,
  ): Promise<TenantProfileDto>;
}
