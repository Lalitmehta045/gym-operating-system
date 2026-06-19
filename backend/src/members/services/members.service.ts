// ============================================================================
// MembersService - Phase 2B
// ============================================================================

import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as QRCode from 'qrcode';
import {
  Member,
  Gender as PrismaGender,
  MemberStatus as PrismaMemberStatus,
  MemberSource as PrismaMemberSource,
  BloodGroup as PrismaBloodGroup,
  Prisma,
} from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  CreateMemberDto,
  ListMembersQueryDto,
  UpdateMemberDto,
  SortBy as QuerySortBy,
  SortOrder as QuerySortOrder,
} from '../dto/index.js';
import { MemberDto, PaginatedMembersDto } from '../dto/index.js';
import { MemberServiceInterface } from '../interfaces/member-service.interface.js';
import {
  Gender as DtoGender,
  MemberStatus as DtoMemberStatus,
  MemberSource as DtoMemberSource,
  BloodGroup as DtoBloodGroup,
} from '../enums/member.enums.js';

import { WhatsappService } from '../../whatsapp/services/whatsapp.service.js';

@Injectable()
export class MembersService implements MemberServiceInterface {
  private readonly logger = new Logger(MembersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
    private readonly jwtService: JwtService,
  ) {}

  async getAllMembers(
    tenantId: string,
    query?: ListMembersQueryDto,
  ): Promise<PaginatedMembersDto> {
    this.assertTenantScope(tenantId);
    await this.assertTenantExists(tenantId);

    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const skip = (page - 1) * limit;
    const includeDeleted = query?.includeDeleted ?? false;
    const includeInactive = query?.includeInactive ?? false;

    const sortBy = query?.sortBy ?? QuerySortBy.CreatedAt;
    const sortOrder = query?.sortOrder ?? QuerySortOrder.Desc;

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy]: sortOrder,
    };

    const where: Prisma.MemberWhereInput = {
      tenantId,
      ...(query?.status ? { status: query.status } : {}),
      ...(query?.gender ? { gender: query.gender } : {}),
      ...(query?.source ? { source: query.source } : {}),
      ...(query?.memberCode
        ? { memberCode: { equals: query.memberCode, mode: 'insensitive' } }
        : {}),
      ...(query?.email
        ? { email: { contains: query.email, mode: 'insensitive' } }
        : {}),
      ...(query?.phone
        ? { phone: { contains: query.phone, mode: 'insensitive' } }
        : {}),
      ...(query?.fitnessGoal
        ? { fitnessGoal: { contains: query.fitnessGoal, mode: 'insensitive' } }
        : {}),
      ...(query?.dateFrom && query?.dateTo
        ? {
            joinedAt: {
              gte: new Date(query.dateFrom),
              lte: new Date(query.dateTo),
            },
          }
        : {}),
      ...(includeInactive ? {} : { isActive: true }),
      ...(includeDeleted ? {} : { deletedAt: null }),
      ...(query?.search
        ? {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { memberCode: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [members, total] = await this.prisma.$transaction([
      this.prisma.member.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          tenantId: true,
          memberCode: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          gender: true,
          dateOfBirth: true,
          photoUrl: true,
          status: true,
          isActive: true,
          joinedAt: true,
          createdAt: true,
        },
      }),
      this.prisma.member.count({ where }),
    ]);

    return {
      data: members.map((m: any) => this.toDto(m)),
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

  async getMemberById(tenantId: string, memberId: string): Promise<MemberDto> {
    this.assertTenantScope(tenantId);
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId, deletedAt: null },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return this.toDto(member);
  }

  async createMember(
    tenantId: string,
    dto: CreateMemberDto,
  ): Promise<MemberDto> {
    this.assertTenantScope(tenantId);
    await this.assertTenantExists(tenantId);
    await this.assertMemberCodeUnique(tenantId, dto.memberCode);

    const member = await this.prisma.member.create({
      data: {
        tenantId,
        memberCode: dto.memberCode,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        gender: dto.gender,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        photoUrl: dto.photoUrl,
        emergencyContactName: dto.emergencyContactName,
        emergencyContactPhone: dto.emergencyContactPhone,
        emergencyContactRelation: dto.emergencyContactRelation,
        heightCm: dto.heightCm,
        weightKg: dto.weightKg,
        fitnessGoal: dto.fitnessGoal,
        notes: dto.notes,
        source: dto.source as PrismaMemberSource,
        occupation: dto.occupation,
        bloodGroup: dto.bloodGroup as PrismaBloodGroup,
        status: (dto.status as PrismaMemberStatus) ?? PrismaMemberStatus.ACTIVE,
        isActive: dto.isActive ?? true,
      },
    });

    // Fire-and-forget WhatsApp welcome message
    this.whatsappService
      .sendWelcomeMessage(tenantId, member.id)
      .catch((err) =>
        this.logger?.error('Failed to send welcome message', err),
      );

    return this.toDto(member);
  }

  async updateMember(
    tenantId: string,
    memberId: string,
    dto: UpdateMemberDto,
  ): Promise<MemberDto> {
    this.assertTenantScope(tenantId);
    const existing = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId, deletedAt: null },
      select: { id: true, memberCode: true },
    });

    if (!existing) {
      throw new NotFoundException('Member not found');
    }

    if (dto.memberCode && dto.memberCode !== existing.memberCode) {
      await this.assertMemberCodeUnique(tenantId, dto.memberCode);
    }

    const member = await this.prisma.member.update({
      where: { id: memberId },
      data: {
        ...(dto.memberCode !== undefined && { memberCode: dto.memberCode }),
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.dateOfBirth !== undefined && {
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        }),
        ...(dto.photoUrl !== undefined && { photoUrl: dto.photoUrl }),
        ...(dto.emergencyContactName !== undefined && {
          emergencyContactName: dto.emergencyContactName,
        }),
        ...(dto.emergencyContactPhone !== undefined && {
          emergencyContactPhone: dto.emergencyContactPhone,
        }),
        ...(dto.emergencyContactRelation !== undefined && {
          emergencyContactRelation: dto.emergencyContactRelation,
        }),
        ...(dto.heightCm !== undefined && { heightCm: dto.heightCm }),
        ...(dto.weightKg !== undefined && { weightKg: dto.weightKg }),
        ...(dto.fitnessGoal !== undefined && { fitnessGoal: dto.fitnessGoal }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.source !== undefined && {
          source: dto.source,
        }),
        ...(dto.occupation !== undefined && { occupation: dto.occupation }),
        ...(dto.bloodGroup !== undefined && {
          bloodGroup: dto.bloodGroup,
        }),
        ...(dto.status !== undefined && {
          status: dto.status,
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    return this.toDto(member);
  }

  async softDeleteMember(tenantId: string, memberId: string): Promise<void> {
    this.assertTenantScope(tenantId);

    const existing = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Member not found');
    }

    await this.prisma.member.update({
      where: { id: memberId },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  async restoreMember(tenantId: string, memberId: string): Promise<MemberDto> {
    this.assertTenantScope(tenantId);

    const existing = await this.prisma.member.findFirst({
      where: { id: memberId, tenantId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Member not found');
    }

    const member = await this.prisma.member.update({
      where: { id: memberId },
      data: {
        deletedAt: null,
        isActive: true,
      },
    });

    return this.toDto(member);
  }

  async getMemberByCode(
    tenantId: string,
    memberCode: string,
  ): Promise<MemberDto | null> {
    this.assertTenantScope(tenantId);
    const member = await this.prisma.member.findFirst({
      where: {
        memberCode,
        tenantId,
        deletedAt: null,
      },
    });

    return member ? this.toDto(member) : null;
  }

  async generateQrCode(
    tenantId: string,
    memberId: string,
  ): Promise<{ qrCodeUrl: string }> {
    this.assertTenantScope(tenantId);
    // Parallelize independent checks
    await Promise.all([
      this.assertTenantExists(tenantId),
      this.getMemberById(tenantId, memberId),
    ]);

    const payload = { memberId, tenantId };
    const token = this.jwtService.sign(payload, { expiresIn: '24h' });
    const qrCodeUrl = await QRCode.toDataURL(token);

    return { qrCodeUrl };
  }

  async downloadQrCode(tenantId: string, memberId: string): Promise<Buffer> {
    this.assertTenantScope(tenantId);
    // Parallelize independent checks
    await Promise.all([
      this.assertTenantExists(tenantId),
      this.getMemberById(tenantId, memberId),
    ]);

    const payload = { memberId, tenantId };
    const token = this.jwtService.sign(payload, { expiresIn: '24h' });

    return QRCode.toBuffer(token, { type: 'png' });
  }

  private assertTenantScope(
    tenantId: string | null | undefined,
  ): asserts tenantId is string {
    if (!tenantId) {
      throw new ForbiddenException('Tenant-scoped access is required');
    }
  }

  private async assertTenantExists(tenantId: string): Promise<void> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deletedAt: null, isActive: true },
      select: { id: true },
    });

    if (!tenant) {
      throw new ForbiddenException('Active tenant access is required');
    }
  }

  private async assertMemberCodeUnique(
    tenantId: string,
    memberCode: string,
  ): Promise<void> {
    const exists = await this.prisma.member.findFirst({
      where: {
        tenantId,
        memberCode,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (exists) {
      throw new ForbiddenException(
        `Member code "${memberCode}" is already in use within this tenant`,
      );
    }
  }

  private toDto(member: Member): MemberDto {
    return {
      id: member.id,
      tenantId: member.tenantId,
      memberCode: member.memberCode,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      gender: member.gender,
      dateOfBirth: member.dateOfBirth?.toISOString().split('T')[0] ?? null,
      photoUrl: member.photoUrl,
      emergencyContactName: member.emergencyContactName,
      emergencyContactPhone: member.emergencyContactPhone,
      emergencyContactRelation: member.emergencyContactRelation,
      heightCm: member.heightCm?.toFixed(2) ?? null,
      weightKg: member.weightKg?.toFixed(2) ?? null,
      fitnessGoal: member.fitnessGoal,
      notes: member.notes,
      source: member.source,
      occupation: member.occupation,
      bloodGroup: member.bloodGroup,
      status: member.status,
      isActive: member.isActive,
      joinedAt: member.joinedAt,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      deletedAt: member.deletedAt,
    };
  }
}
