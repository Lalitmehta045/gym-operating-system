// ============================================================================
// TenantProfileDto - Phase 2A tenant profile read contract
// ============================================================================

import { BusinessHourDto } from './update-tenant-profile.dto.js';

export class TenantProfileDto {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  gymLogoUrl?: string | null;
  gymDescription?: string | null;
  gymWebsite?: string | null;
  gstNumber?: string | null;
  timezone: string;
  currency: string;
  businessHours?: BusinessHourDto[] | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
