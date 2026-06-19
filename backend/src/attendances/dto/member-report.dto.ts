// MemberAttendanceReportDto

export interface MemberAttendanceReportDto {
  memberId: string;
  memberName: string;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalMissed: number;
  attendancePercentage: number;
  lastAttendanceDate: Date | null;
}
