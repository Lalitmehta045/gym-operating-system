// ============================================================================
// MembershipPlanDto - Phase 2A membership plan read contract
// ============================================================================

import { PlanType } from './create-membership-plan.dto.js';

export class MembershipPlanDto {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  planType: PlanType;
  durationDays: number;
  price: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
