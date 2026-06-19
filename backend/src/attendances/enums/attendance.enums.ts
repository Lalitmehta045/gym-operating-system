// ============================================================================
// Attendance Enums - Phase 4A
// ============================================================================

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  MISSED = 'MISSED',
}

export const AttendanceStatusOptions = [
  AttendanceStatus.PRESENT,
  AttendanceStatus.ABSENT,
  AttendanceStatus.LATE,
  AttendanceStatus.MISSED,
] as const;

export type AttendanceStatusType = (typeof AttendanceStatusOptions)[number];
