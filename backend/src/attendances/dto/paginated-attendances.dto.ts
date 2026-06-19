// ============================================================================
// PaginatedAttendancesDto - Phase 4A paginated response envelope
// ============================================================================

import type { AttendanceDto } from './attendance.dto.js';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedAttendancesDto {
  data: AttendanceDto[];
  meta: PaginationMeta;
}
