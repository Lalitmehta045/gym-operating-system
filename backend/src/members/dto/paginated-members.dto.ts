// ============================================================================
// PaginatedMembersDto - Phase 3B paginated response envelope
// ============================================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedMembersDto {
  data: import('./member.dto.js').MemberDto[];
  meta: PaginationMeta;
}
