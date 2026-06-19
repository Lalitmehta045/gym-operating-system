// ============================================================================
// Member Service Interface - Phase 2B
// ============================================================================

import { MemberDto } from '../dto/member.dto.js';
import { PaginatedMembersDto } from '../dto/paginated-members.dto.js';
import { CreateMemberDto } from '../dto/create-member.dto.js';
import { UpdateMemberDto } from '../dto/update-member.dto.js';
import { ListMembersQueryDto } from '../dto/list-members-query.dto.js';

export interface MemberServiceInterface {
  getAllMembers(
    tenantId: string,
    query?: ListMembersQueryDto,
  ): Promise<PaginatedMembersDto>;
  getMemberById(tenantId: string, memberId: string): Promise<MemberDto>;
  createMember(tenantId: string, dto: CreateMemberDto): Promise<MemberDto>;
  updateMember(
    tenantId: string,
    memberId: string,
    dto: UpdateMemberDto,
  ): Promise<MemberDto>;
  softDeleteMember(tenantId: string, memberId: string): Promise<void>;
  restoreMember(tenantId: string, memberId: string): Promise<MemberDto>;
  getMemberByCode(
    tenantId: string,
    memberCode: string,
  ): Promise<MemberDto | null>;
}
