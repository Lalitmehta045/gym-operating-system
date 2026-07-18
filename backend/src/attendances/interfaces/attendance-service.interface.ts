// ============================================================================
// AttendanceServiceInterface - Phase 4A service boundary
// ============================================================================

import { CreateAttendanceDto } from '../dto/create-attendance.dto.js';
import { UpdateAttendanceDto } from '../dto/update-attendance.dto.js';
import { ListAttendancesQueryDto } from '../dto/list-attendances-query.dto.js';
import { AttendanceDto } from '../dto/attendance.dto.js';
import { PaginatedAttendancesDto } from '../dto/paginated-attendances.dto.js';
import { MemberAttendanceReportDto } from '../dto/member-report.dto.js';
import { DailyAttendanceReportDto } from '../dto/daily-report.dto.js';
import { MonthlyAttendanceReportDto } from '../dto/monthly-report.dto.js';

export interface AttendanceServiceInterface {
  createCheckIn(
    tenantId: string,
    dto: CreateAttendanceDto,
  ): Promise<AttendanceDto>;
  getAttendanceById(
    tenantId: string,
    attendanceId: string,
  ): Promise<AttendanceDto>;
  listAttendances(
    tenantId: string,
    query?: ListAttendancesQueryDto,
  ): Promise<PaginatedAttendancesDto>;
  updateCheckOut(
    tenantId: string,
    attendanceId: string,
    dto: UpdateAttendanceDto,
  ): Promise<AttendanceDto>;
  softDeleteAttendance(tenantId: string, attendanceId: string): Promise<void>;
  restoreAttendance(
    tenantId: string,
    attendanceId: string,
  ): Promise<AttendanceDto>;
  getAttendancesByMember(
    tenantId: string,
    memberId: string,
    query?: ListAttendancesQueryDto,
  ): Promise<PaginatedAttendancesDto>;
  getActiveCheckIn(
    tenantId: string,
    memberId: string,
  ): Promise<AttendanceDto | null>;

  // Phase 4B-1 additions
  checkIn(
    tenantId: string,
    markedByUserId: string,
    memberId: string,
    checkInTime?: string,
    checkOutTime?: string,
    notes?: string,
  ): Promise<AttendanceDto>;
  checkOut(
    tenantId: string,
    attendanceId: string,
    markedByUserId: string,
  ): Promise<AttendanceDto>;
  createManualAttendance(
    tenantId: string,
    markedByUserId: string,
    dto: import('../dto/manual-attendance.dto.js').ManualAttendanceDto,
  ): Promise<AttendanceDto>;

  // Phase 4B-2 report additions
  memberReport(
    tenantId: string,
    memberId: string,
  ): Promise<MemberAttendanceReportDto>;
  dailyReport(tenantId: string): Promise<DailyAttendanceReportDto>;
  monthlyReport(tenantId: string): Promise<MonthlyAttendanceReportDto>;
}
