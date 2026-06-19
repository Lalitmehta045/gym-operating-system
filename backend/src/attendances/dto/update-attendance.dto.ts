// ============================================================================
// UpdateAttendanceDto - Phase 4A check-out update contract
// ============================================================================

import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { AttendanceStatus } from '../enums/attendance.enums.js';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsDateString()
  checkOutAt?: string;

  @IsOptional()
  @IsUUID()
  markedByUserId?: string | null;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
