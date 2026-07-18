// ============================================================================
// ListAttendancesQueryDto - Phase 4A query DTO for attendance directory
// ============================================================================

import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

import { AttendanceStatus } from '../enums/attendance.enums.js';

export enum AttendanceSortBy {
  AttendanceDate = 'attendanceDate',
  CheckInAt = 'checkInAt',
  CreatedAt = 'createdAt',
  Status = 'status',
}

export enum AttendanceSortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

export class ListAttendancesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @IsUUID()
  @IsString()
  @MaxLength(50)
  memberId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  memberCode?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeDeleted?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isInside?: boolean;

  @IsOptional()
  @IsEnum(AttendanceSortBy)
  sortBy?: AttendanceSortBy = AttendanceSortBy.AttendanceDate;

  @IsOptional()
  @IsEnum(AttendanceSortOrder)
  sortOrder?: AttendanceSortOrder = AttendanceSortOrder.Desc;
}
