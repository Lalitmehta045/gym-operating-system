// ============================================================================
// Attendance Service - Phase 4B-1 implementation
// ============================================================================

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '../../../generated/prisma/client.js';
import {
  AttendanceStatus,
  Prisma as PrismaNamespace,
} from '../../../generated/prisma/client.js';

import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateAttendanceDto } from '../dto/create-attendance.dto.js';
import { AttendanceDto } from '../dto/attendance.dto.js';
import { ListAttendancesQueryDto } from '../dto/list-attendances-query.dto.js';
import { PaginatedAttendancesDto } from '../dto/paginated-attendances.dto.js';
import { UpdateAttendanceDto } from '../dto/update-attendance.dto.js';
import { AttendanceServiceInterface } from '../interfaces/attendance-service.interface.js';
import { ManualAttendanceDto } from '../dto/manual-attendance.dto.js';
import { MemberAttendanceReportDto } from '../dto/member-report.dto.js';
import { DailyAttendanceReportDto } from '../dto/daily-report.dto.js';
import { MonthlyAttendanceReportDto } from '../dto/monthly-report.dto.js';
import { KioskCheckInDto } from '../dto/kiosk-checkin.dto.js';

@Injectable()
export class AttendanceService implements AttendanceServiceInterface {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Check-in by memberId — used by /attendances/check-in
  async checkIn(
    tenantId: string,
    markedByUserId: string,
    memberId: string,
  ): Promise<AttendanceDto> {
    if (!tenantId)
      throw new ForbiddenException('Tenant-scoped access is required');

    // attendanceDate = current date (calendar date)
    const today = new Date();
    const attendanceDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    // validate member is active and in good standing
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId, deletedAt: null },
      select: { id: true, isActive: true, status: true },
    });
    if (!member) throw new NotFoundException('Member not found');

    if (!member.isActive) {
      throw new BadRequestException('Member is not active');
    }

    if (member.status !== 'ACTIVE') {
      throw new BadRequestException('Member status must be ACTIVE');
    }

    // prevent duplicate check-in for same attendanceDate
    const existing = await this.prisma.attendance.findFirst({
      where: {
        tenantId,
        memberId,
        attendanceDate,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException('Member already checked-in for today');
    }

    const attendance = await this.prisma.attendance.create({
      data: {
        tenantId,
        memberId,
        markedByUserId,
        checkInAt: new Date(),
        attendanceDate,
        status: AttendanceStatus.PRESENT,
      },
    });

    return this.toDto(attendance);
  }

  async processQrScan(
    tenantId: string,
    markedByUserId: string,
    qrToken: string,
  ): Promise<AttendanceDto> {
    if (!tenantId)
      throw new ForbiddenException('Tenant-scoped access is required');

    let payload: any;
    try {
      payload = this.jwtService.verify(qrToken);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired QR token');
    }

    if (payload.tenantId !== tenantId) {
      throw new ForbiddenException('QR code belongs to a different tenant');
    }

    const memberId = payload.memberId;
    if (!memberId) {
      throw new BadRequestException('Invalid QR token payload');
    }

    // Call checkIn which handles validations and duplicate prevention
    // and soft delete awareness (by checking deletedAt: null)
    try {
      return await this.checkIn(tenantId, markedByUserId, memberId);
    } catch (error) {
      if (
        error instanceof BadRequestException &&
        error.message === 'Member already checked-in for today'
      ) {
        throw new ConflictException('Already Checked In');
      }
      throw error;
    }
  }

  async kioskMemberSearch(gymId: string, query: string) {
    // Validate query length
    if (!query || query.trim().length < 3) {
      throw new BadRequestException('Search query must be at least 3 characters');
    }

    const members = await this.prisma.member.findMany({
      where: {
        tenantId: gymId,
        deletedAt: null,
        isActive: true,
        status: 'ACTIVE',
        OR: [
          {
            firstName: {
              contains: query.trim(),
              mode: 'insensitive'
            }
          },
          {
            lastName: {
              contains: query.trim(),
              mode: 'insensitive'
            }
          },
          {
            // full name search: "rahul sh" matches firstName+lastName
            AND: [
              {
                firstName: {
                  contains: query.trim().split(' ')[0],
                  mode: 'insensitive'
                }
              },
              query.trim().split(' ')[1] ? {
                lastName: {
                  contains: query.trim().split(' ')[1],
                  mode: 'insensitive'
                }
              } : {}
            ]
          }
        ]
      },
      select: {
        id: true,
        memberCode: true,
        firstName: true,
        lastName: true,
      },
      take: 8,
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    });

    return members.map(m => ({
      memberId: m.id,
      memberCode: m.memberCode,
      displayName: `${m.firstName} ${m.lastName}`.trim()
    }));
  }

  async kioskCheckIn(dto: KioskCheckInDto, ip: string) {
    const { gymId, memberId, phoneLast4 } = dto;

    const member = await this.prisma.member.findFirst({
      where: {
        id: memberId,
        tenantId: gymId,
        deletedAt: null,
      },
      select: {
        id: true,
        tenantId: true,
        firstName: true,
        lastName: true,
        status: true,
        isActive: true,
        phone: true,
        memberCode: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.status !== 'ACTIVE' || member.isActive !== true) {
      throw new ForbiddenException('Member account is inactive or suspended');
    }

    const memberPhoneLast4 = member.phone ? member.phone.slice(-4) : '';
    if (memberPhoneLast4 !== phoneLast4) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const nowIST = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    );
    const attendanceDate = new Date(
      nowIST.getFullYear(), 
      nowIST.getMonth(), 
      nowIST.getDate()
    );

    const existing = await this.prisma.attendance.findFirst({
      where: {
        tenantId: member.tenantId,
        memberId: member.id,
        attendanceDate,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Already checked in today');
    }

    const attendance = await this.prisma.attendance.create({
      data: {
        tenantId: member.tenantId,
        memberId: member.id,
        markedByUserId: null,
        checkInAt: new Date(), // UTC time
        attendanceDate,
        status: AttendanceStatus.PRESENT,
        notes: 'Kiosk self check-in',
      },
    });

    return {
      success: true,
      memberName: `${member.firstName} ${member.lastName}`.trim(),
      memberCode: member.memberCode,
      checkInAt: attendance.checkInAt,
    };
  }

  // Check-out by attendanceId — used by /attendances/check-out
  async checkOut(
    tenantId: string,
    attendanceId: string,
    markedByUserId: string,
  ): Promise<AttendanceDto> {
    if (!tenantId)
      throw new ForbiddenException('Tenant-scoped access is required');

    const attendance = await this.prisma.attendance.findFirst({
      where: { id: attendanceId, tenantId, deletedAt: null },
    });
    if (!attendance) throw new NotFoundException('Attendance not found');

    if (attendance.checkOutAt) {
      throw new BadRequestException('Attendance already checked-out');
    }

    const now = new Date();
    if (attendance.checkInAt && now <= new Date(attendance.checkInAt)) {
      throw new BadRequestException(
        'Check-out time must be after check-in time',
      );
    }

    const updated = await this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        checkOutAt: now,
        markedByUserId: markedByUserId ?? attendance.markedByUserId,
      },
    });

    return this.toDto(updated);
  }

  // Manual attendance creation by manager/owner
  async createManualAttendance(
    tenantId: string,
    markedByUserId: string,
    dto: ManualAttendanceDto,
  ): Promise<AttendanceDto> {
    if (!tenantId)
      throw new ForbiddenException('Tenant-scoped access is required');

    // validate member
    const member = await this.prisma.member.findFirst({
      where: { id: dto.memberId, tenantId, deletedAt: null },
      select: { id: true, isActive: true, status: true },
    });
    if (!member) throw new NotFoundException('Member not found');

    if (!member.isActive) {
      throw new BadRequestException('Member is not active');
    }

    if (member.status !== 'ACTIVE') {
      throw new BadRequestException('Member status must be ACTIVE');
    }

    const attendanceDate = new Date(dto.attendanceDate);
    attendanceDate.setHours(0, 0, 0, 0);

    // prevent duplicate attendance for same member/date
    const existing = await this.prisma.attendance.findFirst({
      where: {
        tenantId,
        memberId: dto.memberId,
        attendanceDate,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException(
        'Attendance for member on this date already exists',
      );
    }

    // checkInAt is required in schema; use attendanceDate as base. For PRESENT/LATE set checkInAt to attendanceDate start,
    // caller can update checkInAt/checkOutAt later if needed.
    const checkInAt = new Date(attendanceDate);

    const attendance = await this.prisma.attendance.create({
      data: {
        tenantId,
        memberId: dto.memberId,
        markedByUserId,
        checkInAt,
        attendanceDate,
        status: dto.status,
        notes: dto.notes ?? null,
      },
    });

    return this.toDto(attendance);
  }

  // --- Phase 4A / helper methods kept for compatibility ---
  async createCheckIn(
    tenantId: string,
    dto: CreateAttendanceDto,
  ): Promise<AttendanceDto> {
    // Backwards-compatible wrapper — validate and delegate
    if (!tenantId)
      throw new ForbiddenException('Tenant-scoped access is required');

    // Ensure member belongs to tenant and is active
    const member = await this.prisma.member.findFirst({
      where: { id: dto.memberId, tenantId, deletedAt: null },
      select: { id: true, isActive: true, status: true },
    });
    if (!member) throw new NotFoundException('Member not found');

    if (!member.isActive) throw new BadRequestException('Member is not active');
    if (member.status !== 'ACTIVE')
      throw new BadRequestException('Member status must be ACTIVE');

    const attendanceDate = new Date(dto.attendanceDate);
    attendanceDate.setHours(0, 0, 0, 0);

    const existing = await this.prisma.attendance.findFirst({
      where: {
        tenantId,
        memberId: dto.memberId,
        attendanceDate,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (existing)
      throw new BadRequestException('Attendance already exists for this date');

    const attendance = await this.prisma.attendance.create({
      data: {
        tenantId,
        memberId: dto.memberId,
        markedByUserId: dto.markedByUserId ?? null,
        checkInAt: new Date(dto.checkInAt),
        attendanceDate,
        status: dto.status ?? AttendanceStatus.PRESENT,
        notes: dto.notes ?? null,
      },
    });

    return this.toDto(attendance);
  }

  async getAttendanceById(
    tenantId: string,
    attendanceId: string,
  ): Promise<AttendanceDto> {
    const attendance = await this.prisma.attendance.findFirst({
      where: { id: attendanceId, tenantId },
    });
    if (!attendance) throw new NotFoundException('Attendance not found');
    return this.toDto(attendance);
  }

  async listAttendances(
    tenantId: string,
    query?: ListAttendancesQueryDto,
  ): Promise<PaginatedAttendancesDto> {
    // Minimal listing implementation for compatibility; advanced querying out of scope for 4B-1
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AttendanceWhereInput = {
      tenantId,
      ...(query?.memberId ? { memberId: query.memberId } : {}),
      ...(query?.status ? { status: query.status } : {}),
      ...(query?.dateFrom && query?.dateTo
        ? {
            attendanceDate: {
              gte: new Date(query.dateFrom),
              lte: new Date(query.dateTo),
            },
          }
        : {}),
      ...(query?.includeDeleted ? {} : { deletedAt: null }),
    };

    const sortBy =
      (query?.sortBy as keyof Prisma.AttendanceOrderByWithRelationInput) ||
      'attendanceDate';
    const sortOrder = (query?.sortOrder as 'asc' | 'desc') || 'desc';

    // Only allow specific fields for ordering to avoid injection
    const allowedSortFields = [
      'attendanceDate',
      'checkInAt',
      'createdAt',
      'status',
    ];
    const orderBy: any = {};
    if (allowedSortFields.includes(String(sortBy))) {
      orderBy[String(sortBy)] = sortOrder;
    } else {
      orderBy.attendanceDate = 'desc';
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              memberCode: true
            }
          },
          markedBy: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
      }),
      this.prisma.attendance.count({ where }),
    ]);

    const resultDto = data.map((a) => this.toDto(a));

    return {
      data: resultDto,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async updateCheckOut(
    tenantId: string,
    attendanceId: string,
    dto: UpdateAttendanceDto,
  ): Promise<AttendanceDto> {
    // For compatibility, delegate to checkOut if only check-out behavior needed
    const attendance = await this.prisma.attendance.findFirst({
      where: { id: attendanceId, tenantId, deletedAt: null },
    });
    if (!attendance) throw new NotFoundException('Attendance not found');

    if (dto.checkOutAt && attendance.checkOutAt) {
      throw new BadRequestException('Attendance already checked-out');
    }

    const updated = await this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        ...(dto.checkOutAt !== undefined && {
          checkOutAt: new Date(dto.checkOutAt),
        }),
        ...(dto.markedByUserId !== undefined && {
          markedByUserId: dto.markedByUserId,
        }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });

    return this.toDto(updated);
  }

  async softDeleteAttendance(
    tenantId: string,
    attendanceId: string,
  ): Promise<void> {
    const existing = await this.prisma.attendance.findFirst({
      where: { id: attendanceId, tenantId, deletedAt: null },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Attendance not found');

    await this.prisma.attendance.update({
      where: { id: attendanceId },
      data: { deletedAt: new Date() },
    });
  }

  async restoreAttendance(
    tenantId: string,
    attendanceId: string,
  ): Promise<AttendanceDto> {
    const existing = await this.prisma.attendance.findFirst({
      where: { id: attendanceId, tenantId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Attendance not found');

    const attendance = await this.prisma.attendance.update({
      where: { id: attendanceId },
      data: { deletedAt: null },
    });
    return this.toDto(attendance);
  }

  async getAttendancesByMember(
    tenantId: string,
    memberId: string,
    query: ListAttendancesQueryDto = {},
  ): Promise<PaginatedAttendancesDto> {
    return this.listAttendances(tenantId, { ...query, memberId });
  }

  async getActiveCheckIn(
    tenantId: string,
    memberId: string,
  ): Promise<AttendanceDto | null> {
    const attendance = await this.prisma.attendance.findFirst({
      where: {
        tenantId,
        memberId,
        checkOutAt: null,
        deletedAt: null,
        attendanceDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      orderBy: { checkInAt: 'desc' },
    });
    return attendance ? this.toDto(attendance) : null;
  }

  async memberReport(
    tenantId: string,
    memberId: string,
  ): Promise<MemberAttendanceReportDto> {
    if (!tenantId)
      throw new ForbiddenException('Tenant-scoped access is required');

    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId, deletedAt: null },
      select: { id: true, firstName: true, lastName: true },
    });
    if (!member) throw new NotFoundException('Member not found');

    const [attGroups, last] = await Promise.all([
      this.prisma.attendance.groupBy({
        by: ['status'],
        where: { tenantId, memberId, deletedAt: null },
        _count: true,
      }),
      this.prisma.attendance.findFirst({
        where: { tenantId, memberId, deletedAt: null },
        orderBy: { attendanceDate: 'desc' },
        select: { attendanceDate: true },
      }),
    ]);

    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalMissed = 0;

    for (const group of attGroups) {
      const count = group._count;
      if (group.status === AttendanceStatus.PRESENT) {
        totalPresent = count;
      } else if (group.status === AttendanceStatus.ABSENT) {
        totalAbsent = count;
      } else if (group.status === AttendanceStatus.LATE) {
        totalLate = count;
      } else if (group.status === AttendanceStatus.MISSED) {
        totalMissed = count;
      }
    }

    const totalRecords = totalPresent + totalAbsent + totalLate + totalMissed;
    const attendancePercentage =
      totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;

    return {
      memberId,
      memberName: `${member.firstName} ${member.lastName}`.trim(),
      totalPresent,
      totalAbsent,
      totalLate,
      totalMissed,
      attendancePercentage,
      lastAttendanceDate: last ? last.attendanceDate : null,
    };
  }

  async dailyReport(tenantId: string): Promise<DailyAttendanceReportDto> {
    if (!tenantId)
      throw new ForbiddenException('Tenant-scoped access is required');

    const todayIST = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    );
    const startOfTodayIST = new Date(
      todayIST.getFullYear(), 
      todayIST.getMonth(), 
      todayIST.getDate()
    );
    const endOfTodayIST = new Date(
      todayIST.getFullYear(), 
      todayIST.getMonth(), 
      todayIST.getDate(), 
      23, 59, 59, 999
    );

    const [totalMembers, attGroups] = await Promise.all([
      this.prisma.member.count({
        where: { tenantId, deletedAt: null, isActive: true },
      }),
      this.prisma.attendance.groupBy({
        by: ['status'],
        where: {
          tenantId,
          deletedAt: null,
          attendanceDate: {
            gte: startOfTodayIST,
            lte: endOfTodayIST
          }
        },
        _count: true,
      }),
    ]);

    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let missedCount = 0;

    for (const group of attGroups) {
      const count = group._count;
      if (group.status === AttendanceStatus.PRESENT) {
        presentCount = count;
      } else if (group.status === AttendanceStatus.ABSENT) {
        absentCount = count;
      } else if (group.status === AttendanceStatus.LATE) {
        lateCount = count;
      } else if (group.status === AttendanceStatus.MISSED) {
        missedCount = count;
      }
    }

    const attendanceRate =
      totalMembers > 0 ? (presentCount / totalMembers) * 100 : 0;

    return {
      totalMembers,
      presentCount,
      absentCount,
      lateCount,
      missedCount,
      attendanceRate,
    };
  }

  async monthlyReport(tenantId: string): Promise<MonthlyAttendanceReportDto> {
    if (!tenantId)
      throw new ForbiddenException('Tenant-scoped access is required');

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const attGroups = await this.prisma.attendance.groupBy({
      by: ['status'],
      where: {
        tenantId,
        attendanceDate: { gte: firstDay, lte: lastDay },
        deletedAt: null,
      },
      _count: true,
    });

    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalMissed = 0;

    for (const group of attGroups) {
      const count = group._count;
      if (group.status === AttendanceStatus.PRESENT) {
        totalPresent = count;
      } else if (group.status === AttendanceStatus.ABSENT) {
        totalAbsent = count;
      } else if (group.status === AttendanceStatus.LATE) {
        totalLate = count;
      } else if (group.status === AttendanceStatus.MISSED) {
        totalMissed = count;
      }
    }

    const totalRecords = totalPresent + totalAbsent + totalLate + totalMissed;
    const attendancePercentage =
      totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;
    const daysInMonth = lastDay.getDate() || 1;
    const averageDailyAttendance = totalPresent / daysInMonth;

    return {
      totalPresent,
      totalAbsent,
      totalLate,
      totalMissed,
      attendancePercentage,
      averageDailyAttendance,
    };
  }

  private toDto(a: any): AttendanceDto {
    return {
      id: a.id,
      tenantId: a.tenantId,
      memberId: a.memberId,
      markedByUserId: a.markedByUserId ?? null,
      checkInAt: a.checkInAt,
      checkOutAt: a.checkOutAt ?? null,
      attendanceDate: a.attendanceDate,
      status: a.status,
      notes: a.notes ?? null,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      deletedAt: a.deletedAt ?? null,
      member: a.member ? {
        firstName: a.member.firstName,
        lastName: a.member.lastName,
        memberCode: a.member.memberCode,
      } : undefined,
      memberName: a.member 
        ? `${a.member.firstName} ${a.member.lastName}`.trim()
        : 'Unknown',
    };
  }
}
