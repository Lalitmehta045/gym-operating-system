import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateStaffDto } from '../dto/create-staff.dto.js';
import { UpdateStaffRoleDto } from '../dto/update-staff-role.dto.js';
import * as bcrypt from 'bcrypt';
import { Role } from '../../../generated/prisma/client.js';

const SALT_ROUNDS = 12;

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllStaff(tenantId: string, page = 1, limit = 20) {
    const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
    const pageSize = Number.isFinite(limit) && limit > 0 ? limit : 20;
    const skip = (currentPage - 1) * pageSize;
    const where = {
      tenantId,
      role: { not: Role.SUPER_ADMIN },
      deletedAt: null,
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page: currentPage, limit: pageSize };
  }

  async createStaff(tenantId: string, dto: CreateStaffDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: {
        uq_user_tenant_email: {
          tenantId,
          email: dto.email,
        },
      },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists in your gym');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash,
        role: dto.role,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  async updateStaffRole(tenantId: string, userId: string, dto: UpdateStaffRoleDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('Staff member not found');
    }

    if (user.role === Role.OWNER) {
      throw new ForbiddenException('Cannot change the role of the Owner');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }

  async deactivateStaff(tenantId: string, userId: string, currentUserId: string) {
    if (userId === currentUserId) {
      throw new BadRequestException('Cannot deactivate your own account');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('Staff member not found');
    }

    if (user.role === Role.OWNER) {
      throw new ForbiddenException('Cannot deactivate the Owner account');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return updatedUser;
  }

  async reactivateStaff(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('Staff member not found');
    }

    if (user.role === Role.OWNER) {
      throw new ForbiddenException('Owner account cannot be modified');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return updatedUser;
  }
}
