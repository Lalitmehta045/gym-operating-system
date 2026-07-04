// ============================================================================
// MembersController - Phase 3B Member management API
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
  Res,
  StreamableFile,
  UseInterceptors,
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import type { Response } from 'express';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { Role, AuditEntity, AuditAction } from '../../../generated/prisma/client.js';
import { AuditLog } from '../../audit/decorators/audit-log.decorator.js';
import { HttpCacheInterceptor } from '../../common/interceptors/http-cache.interceptor.js';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';
import { CreateMemberDto } from '../dto/create-member.dto.js';
import { ListMembersQueryDto } from '../dto/list-members-query.dto.js';
import { MemberDto } from '../dto/member.dto.js';
import { PaginatedMembersDto } from '../dto/paginated-members.dto.js';
import { UpdateMemberDto } from '../dto/update-member.dto.js';
import { MembersService } from '../services/members.service.js';
import { InvalidateCache } from '../../common/decorators/invalidate-cache.decorator.js';

@Controller('members')
@UseInterceptors(HttpCacheInterceptor)
@InvalidateCache([':tenantId:/api/v1/members*', ':tenantId:/api/v1/dashboard*'])
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER)
  @AuditLog(AuditEntity.MEMBER, AuditAction.CREATE, '👤 Member Created')
  async createMember(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateMemberDto,
  ): Promise<MemberDto> {
    return this.membersService.createMember(this.getTenantId(user), dto);
  }

  @Get()
  @CacheTTL(30000) // 30 seconds
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  async listMembers(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListMembersQueryDto,
  ): Promise<PaginatedMembersDto> {
    return this.membersService.getAllMembers(this.getTenantId(user), query);
  }

  @Get(':id')
  @CacheTTL(600000) // 10 minutes
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  async getMemberById(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) memberId: string,
  ): Promise<MemberDto> {
    return this.membersService.getMemberById(this.getTenantId(user), memberId);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  @AuditLog(AuditEntity.MEMBER, AuditAction.UPDATE, '✏️ Member Updated')
  async updateMember(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) memberId: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<MemberDto> {
    return this.membersService.updateMember(
      this.getTenantId(user),
      memberId,
      dto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.OWNER)
  @AuditLog(AuditEntity.MEMBER, AuditAction.DELETE, '🗑️ Member Deleted')
  async deleteMember(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) memberId: string,
  ): Promise<void> {
    return this.membersService.softDeleteMember(
      this.getTenantId(user),
      memberId,
    );
  }

  @Post(':id/restore')
  @Roles(Role.OWNER)
  async restoreMember(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) memberId: string,
  ): Promise<MemberDto> {
    return this.membersService.restoreMember(this.getTenantId(user), memberId);
  }

  @Get(':id/qr')
  @CacheTTL(3600000) // 1 hour
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  async getQrCode(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) memberId: string,
  ): Promise<{ qrCodeUrl: string }> {
    return this.membersService.generateQrCode(this.getTenantId(user), memberId);
  }

  @Get(':id/qr/download')
  @CacheTTL(3600000) // 1 hour
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  async downloadQrCode(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) memberId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const buffer = await this.membersService.downloadQrCode(
      this.getTenantId(user),
      memberId,
    );

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="member-${memberId}-qr.png"`,
    });

    return new StreamableFile(buffer);
  }

  private getTenantId(user: JwtPayload): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant-scoped access is required');
    }

    return user.tenantId;
  }
}
