// ============================================================================
// MembershipPlanServiceInterface - Phase 2A service boundary
// ============================================================================

import { CreateMembershipPlanDto } from '../dto/create-membership-plan.dto.js';
import { ListMembershipPlansQueryDto } from '../dto/list-membership-plans-query.dto.js';
import { MembershipPlanDto } from '../dto/membership-plan.dto.js';
import { PaginatedMembershipPlansDto } from '../dto/paginated-membership-plans.dto.js';
import { UpdateMembershipPlanDto } from '../dto/update-membership-plan.dto.js';

export interface MembershipPlanServiceInterface {
  createPlan(
    tenantId: string,
    dto: CreateMembershipPlanDto,
  ): Promise<MembershipPlanDto>;
  getPlanById(tenantId: string, planId: string): Promise<MembershipPlanDto>;
  listPlans(
    tenantId: string,
    query?: ListMembershipPlansQueryDto,
  ): Promise<PaginatedMembershipPlansDto>;
  updatePlan(
    tenantId: string,
    planId: string,
    dto: UpdateMembershipPlanDto,
  ): Promise<MembershipPlanDto>;
  softDeletePlan(tenantId: string, planId: string): Promise<void>;
  restorePlan(tenantId: string, planId: string): Promise<MembershipPlanDto>;
}
