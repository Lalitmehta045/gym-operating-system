// ============================================================================
// AttendanceDto - Phase 4A response DTO for a single attendance record
// ============================================================================

import { AttendanceStatus } from '../enums/attendance.enums.js';

export interface AttendanceDto {
  id: string;
  tenantId: string;
  memberId: string;
  markedByUserId: string | null;
  checkInAt: Date;
  checkOutAt: Date | null;
  attendanceDate: Date;
  status: AttendanceStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface AttendanceWithMemberDto extends AttendanceDto {
  member: {
    id: string;
    memberCode: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
