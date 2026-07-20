// ============================================================================
// ListMembershipPlansQueryDto - Phase 2B plan listing filters
// ============================================================================

import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PlanType } from './create-membership-plan.dto.js';

export class ListMembershipPlansQueryDto {
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
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    value === '' ? undefined : (value as string),
  )
  search?: string;

  @IsOptional()
  @IsEnum(PlanType)
  @Transform(({ value }: { value: unknown }) =>
    value === '' ? undefined : (value as PlanType),
  )
  planType?: PlanType;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeInactive?: boolean = false;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeDeleted?: boolean = false;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minDuration?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxDuration?: number;

  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;
}

export class MembershipPlanListMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
