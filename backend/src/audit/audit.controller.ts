import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role, AuditEntity, AuditAction } from '../../generated/prisma/client.js';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface.js';
import { AuditService } from './audit.service.js';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.OWNER, Role.MANAGER, Role.SUPER_ADMIN)
  async getLogs(
    @CurrentUser() user: JwtPayload,
    @Query('entity') entity?: AuditEntity,
    @Query('action') action?: AuditAction,
    @Query('userId') userId?: string,
    @Query('memberId') memberId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const tenantId = user.role === Role.SUPER_ADMIN ? null : this.getTenantId(user);
    
    // MANAGER can only view operational logs
    // Operational logs could mean restricting some entities, but for now we let service handle tenant scoping.
    return this.auditService.getLogs(tenantId, {
      entity,
      action,
      userId,
      memberId,
      startDate,
      endDate,
      search,
      skip: skip ? parseInt(skip, 10) : 0,
      take: take ? parseInt(take, 10) : 20,
    });
  }

  @Get('platform')
  @Roles(Role.SUPER_ADMIN)
  async getPlatformLogs(
    @Query('entity') entity?: AuditEntity,
    @Query('action') action?: AuditAction,
    @Query('userId') userId?: string,
    @Query('memberId') memberId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.auditService.getLogs(null, {
      entity,
      action,
      userId,
      memberId,
      startDate,
      endDate,
      search,
      skip: skip ? parseInt(skip, 10) : 0,
      take: take ? parseInt(take, 10) : 20,
    });
  }

  @Get('member/:id')
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  async getMemberTimeline(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) memberId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const tenantId = this.getTenantId(user);
    return this.auditService.getMemberTimeline(
      tenantId,
      memberId,
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
    );
  }

  @Get('user/:id')
  @Roles(Role.OWNER, Role.SUPER_ADMIN)
  async getUserHistory(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) targetUserId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const tenantId = user.role === Role.SUPER_ADMIN ? null : this.getTenantId(user);
    // Note: SUPER_ADMIN handles globally, so we'll need to fetch by userId without tenant scoping
    if (user.role === Role.SUPER_ADMIN) {
        return this.auditService.getLogs(null, {
            userId: targetUserId,
            skip: skip ? parseInt(skip, 10) : 0,
            take: take ? parseInt(take, 10) : 20,
        });
    }

    return this.auditService.getUserHistory(
      tenantId as string,
      targetUserId,
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
    );
  }

  private getTenantId(user: JwtPayload): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant-scoped access is required');
    }
    return user.tenantId;
  }
}
