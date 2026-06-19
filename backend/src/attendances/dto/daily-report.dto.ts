// DailyAttendanceReportDto

export interface DailyAttendanceReportDto {
  totalMembers: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  missedCount: number;
  attendanceRate: number; // percentage
}
