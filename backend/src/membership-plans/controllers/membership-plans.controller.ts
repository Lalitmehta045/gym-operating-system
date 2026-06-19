// ============================================================================
// MembershipPlansController - Phase 2B membership plan API
// ============================================================================

import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { Role } from '../../../generated/prisma/client.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { HttpCacheInterceptor } from '../../common/interceptors/http-cache.interceptor.js';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';
import { CreateMembershipPlanDto } from '../dto/create-membership-plan.dto.js';
import { ListMembershipPlansQueryDto } from '../dto/list-membership-plans-query.dto.js';
import { MembershipPlanDto } from '../dto/membership-plan.dto.js';
import { PaginatedMembershipPlansDto } from '../dto/paginated-membership-plans.dto.js';
import { UpdateMembershipPlanDto } from '../dto/update-membership-plan.dto.js';
import { MembershipPlansService } from '../services/membership-plans.service.js';
import { InvalidateCache } from '../../common/decorators/invalidate-cache.decorator.js';

@Controller('plans')
@UseInterceptors(HttpCacheInterceptor)
@InvalidateCache([':tenantId:/api/v1/plans*'])
export class MembershipPlansController {
  constructor(
    private readonly membershipPlansService: MembershipPlansService,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER)
  async createPlan(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateMembershipPlanDto,
  ): Promise<MembershipPlanDto> {
    return this.membershipPlansService.createPlan(this.getTenantId(user), dto);
  }

  @Get()
  @CacheTTL(600) // 10 minutes
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  async listPlans(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListMembershipPlansQueryDto,
  ): Promise<PaginatedMembershipPlansDto> {
    return this.membershipPlansService.listPlans(this.getTenantId(user), query);
  }

  @Get(':id')
  @CacheTTL(600) // 10 minutes
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  async getPlanById(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) planId: string,
  ): Promise<MembershipPlanDto> {
    return this.membershipPlansService.getPlanById(
      this.getTenantId(user),
      planId,
    );
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  async updatePlan(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) planId: string,
    @Body() dto: UpdateMembershipPlanDto,
  ): Promise<MembershipPlanDto> {
    return this.membershipPlansService.updatePlan(
      this.getTenantId(user),
      planId,
      dto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.OWNER, Role.MANAGER)
  async deletePlan(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) planId: string,
  ): Promise<void> {
    return this.membershipPlansService.softDeletePlan(
      this.getTenantId(user),
      planId,
    );
  }

  private getTenantId(user: JwtPayload): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant-scoped access is required');
    }

    return user.tenantId;
  }
}
