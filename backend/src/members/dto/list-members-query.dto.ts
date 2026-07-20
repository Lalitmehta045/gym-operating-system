// ============================================================================
// ListMembersQueryDto - Phase 3B query DTO for member directory
// ============================================================================

import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  Gender,
  GenderOptions,
  MemberStatus,
  MemberStatusOptions,
  MemberSource,
} from '../enums/member.enums.js';

export enum SortBy {
  JoinedAt = 'joinedAt',
  CreatedAt = 'createdAt',
  FirstName = 'firstName',
  LastName = 'lastName',
  MemberCode = 'memberCode',
}

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

export class ListMembersQueryDto {
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
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(MemberSource)
  source?: MemberSource;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  memberCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fitnessGoal?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeInactive?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeDeleted?: boolean;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.CreatedAt;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.Desc;

  @IsOptional()
  @IsString()
  membershipStatus?: string;
}
