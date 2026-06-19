// ============================================================================
// Platform DTOs — Phase 9A Super Admin platform visibility
// ============================================================================

import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TenantStatus } from '../../../generated/prisma/client.js';

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

export class ListTenantsQueryDto {
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
  @IsEnum(TenantStatus)
  status?: TenantStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.Desc;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PlatformDashboardDto {
  totalGyms: number;
  activeGyms: number;
  trialGyms: number;
  expiredGyms: number;
  suspendedGyms: number;
}

export interface TenantListItemDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  status: TenantStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    users: number;
    members: number;
    subscriptions: number;
  };
}

export interface PaginatedTenantsDto {
  data: TenantListItemDto[];
  meta: PaginationMeta;
}

export interface TenantOwnerDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface TenantDetailDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  gymLogoUrl: string | null;
  gymDescription: string | null;
  gymWebsite: string | null;
  gstNumber: string | null;
  timezone: string;
  currency: string;
  status: TenantStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  owner: TenantOwnerDto | null;
  memberCount: number;
  subscriptionCount: number;
  userCount: number;
}

export interface RevenueByPlanDto {
  planName: string;
  revenue: number;
}

export interface RevenueMetricsDto {
  mrr: number;
  arr: number;
  revenueThisMonth: number;
  revenueByPlan: RevenueByPlanDto[];
}
