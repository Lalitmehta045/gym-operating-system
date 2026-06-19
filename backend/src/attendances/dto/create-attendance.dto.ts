// ============================================================================
// CreateAttendanceDto - Phase 4A check-in creation contract
// ============================================================================

import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { AttendanceStatus } from '../enums/attendance.enums.js';
import { IsValidCheckInTime } from '../validators/attendance.validators.js';

export class CreateAttendanceDto {
  @IsNotEmpty()
  @IsUUID()
  memberId: string;

  @IsNotEmpty()
  @IsDateString()
  @IsValidCheckInTime({
    message: 'Check-in time cannot be in the future',
  })
  checkInAt: string;

  @IsNotEmpty()
  @IsDateString()
  attendanceDate: string;

  @IsOptional()
  @IsUUID()
  markedByUserId?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus = AttendanceStatus.PRESENT;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
