// ============================================================================
// Attendances Controller - Phase 4B-1
// ============================================================================

import {
  Body,
  Controller,
  NotFoundException,
  Post,
  Param,
  Get,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Role, AuditEntity, AuditAction } from '../../generated/prisma/client.js';
import { AuditLog } from '../audit/decorators/audit-log.decorator.js';
import { HttpCacheInterceptor } from '../common/interceptors/http-cache.interceptor.js';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface.js';
import { AttendanceService } from './services/attendances.service.js';
import { InvalidateCache } from '../common/decorators/invalidate-cache.decorator.js';
import { CheckInDto } from './dto/check-in.dto.js';
import { CheckOutDto } from './dto/check-out.dto.js';
import { ManualAttendanceDto } from './dto/manual-attendance.dto.js';
import { ListAttendancesQueryDto } from './dto/list-attendances-query.dto.js';
import { QrScanDto } from './dto/qr-scan.dto.js';
import { KioskCheckInDto } from './dto/kiosk-checkin.dto.js';
import { Public } from '../auth/decorators/public.decorator.js';

@Controller('attendances')
@UseInterceptors(HttpCacheInterceptor)
@InvalidateCache([
  ':tenantId:/api/v1/attendances*',
  ':tenantId:/api/v1/dashboard*',
])
export class AttendancesController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // Note: This endpoint should be rate-limited at the nginx/gateway level
  @Public()
  @Post('kiosk-checkin')
  async kioskCheckInEndpoint(@Body() body: KioskCheckInDto, @Req() req: any) {
    const ip = req.ip || req.headers['x-forwarded-for'] || '';
    return this.attendanceService.kioskCheckIn(body, ip);
  }

  @Post('check-in')
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  @AuditLog(AuditEntity.ATTENDANCE, AuditAction.CHECK_IN, '✅ Attendance Checked In')
  async checkIn(@Body() body: CheckInDto, @CurrentUser() user: JwtPayload) {
    if (!user?.tenantId) throw new NotFoundException('Tenant context required');
    return this.attendanceService.checkIn(
      user.tenantId,
      user.sub,
      body.memberId,
    );
  }

  @Post('scan')
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  @AuditLog(AuditEntity.ATTENDANCE, AuditAction.CHECK_IN, '✅ Attendance Checked In via QR')
  async scanQr(@Body() body: QrScanDto, @CurrentUser() user: JwtPayload) {
    if (!user?.tenantId) throw new NotFoundException('Tenant context required');
    return this.attendanceService.processQrScan(
      user.tenantId,
      user.sub,
      body.qrToken,
    );
  }

  @Post('check-out')
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  @AuditLog(AuditEntity.ATTENDANCE, AuditAction.CHECK_OUT, '✅ Attendance Checked Out')
  async checkOut(@Body() body: CheckOutDto, @CurrentUser() user: JwtPayload) {
    if (!user?.tenantId) throw new NotFoundException('Tenant context required');
    return this.attendanceService.checkOut(
      user.tenantId,
      body.attendanceId,
      user.sub,
    );
  }

  @Post('manual')
  @Roles(Role.OWNER, Role.MANAGER)
  @AuditLog(AuditEntity.ATTENDANCE, AuditAction.CREATE, '✅ Manual Attendance Added')
  async manual(
    @Body() body: ManualAttendanceDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!user?.tenantId) throw new NotFoundException('Tenant context required');
    return this.attendanceService.createManualAttendance(
      user.tenantId,
      user.sub,
      body,
    );
  }

  @Post(':id/restore')
  @Roles(Role.OWNER, Role.MANAGER)
  async restore(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!user?.tenantId) throw new NotFoundException('Tenant context required');
    return this.attendanceService.restoreAttendance(user.tenantId, id);
  }

  // --- Attendance History endpoints ---
  @Get()
  @CacheTTL(60000) // 1 minute
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  async list(
    @Query() query: ListAttendancesQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!user?.tenantId) throw new NotFoundException('Tenant context required');
    return this.attendanceService.listAttendances(user.tenantId, query);
  }

  @Get(':id')
  @CacheTTL(60000) // 1 minute
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!user?.tenantId) throw new NotFoundException('Tenant context required');
    return this.attendanceService.getAttendanceById(user.tenantId, id);
  }

  @Get('member/:memberId')
  @CacheTTL(60000) // 1 minute
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  async getByMember(
    @Param('memberId', new ParseUUIDPipe({ version: '4' })) memberId: string,
    @Query() query: ListAttendancesQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!user?.tenantId) throw new NotFoundException('Tenant context required');
    return this.attendanceService.getAttendancesByMember(
      user.tenantId,
      memberId,
      query,
    );
  }

  // --- Reports ---
  @Get('reports/member/:memberId')
  @CacheTTL(60000) // 1 minute
  @Roles(Role.OWNER, Role.MANAGER)
  async memberReport(
    @Param('memberId', new ParseUUIDPipe({ version: '4' })) memberId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!user?.tenantId) throw new NotFoundException('Tenant context required');
    return this.attendanceService.memberReport(user.tenantId, memberId);
  }

  @Get('reports/daily')
  @CacheTTL(60000) // 1 minute
  @Roles(Role.OWNER, Role.MANAGER)
  async dailyReport(@CurrentUser() user: JwtPayload) {
    if (!user?.tenantId) throw new NotFoundException('Tenant context required');
    return this.attendanceService.dailyReport(user.tenantId);
  }

  @Get('reports/monthly')
  @CacheTTL(60000) // 1 minute
  @Roles(Role.OWNER, Role.MANAGER)
  async monthlyReport(@CurrentUser() user: JwtPayload) {
    if (!user?.tenantId) throw new NotFoundException('Tenant context required');
    return this.attendanceService.monthlyReport(user.tenantId);
  }
}
