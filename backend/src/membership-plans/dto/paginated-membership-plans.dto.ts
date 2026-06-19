// ============================================================================
// PaginatedMembershipPlansDto - Phase 2B plan list response
// ============================================================================

import { MembershipPlanDto } from './membership-plan.dto.js';
import { MembershipPlanListMetaDto } from './list-membership-plans-query.dto.js';

export class PaginatedMembershipPlansDto {
  data: MembershipPlanDto[];
  meta: MembershipPlanListMetaDto;
}
