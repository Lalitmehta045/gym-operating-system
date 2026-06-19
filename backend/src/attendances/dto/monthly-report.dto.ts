// MonthlyAttendanceReportDto

export interface MonthlyAttendanceReportDto {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalMissed: number;
  attendancePercentage: number; // percent
  averageDailyAttendance: number;
}
