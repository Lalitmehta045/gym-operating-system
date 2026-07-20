import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditEntity, AuditAction } from '../../generated/prisma/client.js';

export interface CreateAuditLogDto {
  tenantId: string;
  userId: string;
  memberId?: string | null;
  entity: AuditEntity;
  entityId: string;
  action: AuditAction;
  description: string;
  metadata?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createLog(dto: CreateAuditLogDto) {
    // Process asynchronously in the background so it doesn't block the request
    Promise.resolve().then(async () => {
      try {
        await this.prisma.auditLog.create({
          data: {
            tenantId: dto.tenantId,
            userId: dto.userId,
            memberId: dto.memberId,
            entity: dto.entity,
            entityId: dto.entityId,
            action: dto.action,
            description: dto.description,
            metadata: dto.metadata || null,
            ipAddress: dto.ipAddress || null,
            userAgent: dto.userAgent || null,
          },
        });
      } catch (error: any) {
        this.logger.error(`Failed to process audit log: ${error.message}`, error.stack);
      }
    });
    
    return true;
  }

  async getLogs(
    tenantId: string | null,
    query: {
      entity?: AuditEntity;
      action?: AuditAction;
      userId?: string;
      memberId?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
      skip?: number;
      take?: number;
    },
  ) {
    const where: any = {};
    
    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (query.entity) {
      where.entity = query.entity;
    }
    
    if (query.action) {
      where.action = query.action;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.memberId) {
      where.memberId = query.memberId;
    }

    if (query.startDate && query.endDate) {
      where.createdAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    } else if (query.startDate) {
      where.createdAt = { gte: new Date(query.startDate) };
    } else if (query.endDate) {
      where.createdAt = { lte: new Date(query.endDate) };
    }

    if (query.search) {
      where.OR = [
        { description: { contains: query.search, mode: 'insensitive' } },
        { ipAddress: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip || 0,
        take: query.take || 20,
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          description: true,
          createdAt: true,
          userId: true,
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        skip: query.skip || 0,
        take: query.take || 20,
      },
    };
  }

  async getMemberTimeline(tenantId: string, memberId: string, skip = 0, take = 20) {
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId, memberId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          description: true,
          createdAt: true,
          userId: true,
        },
      }),
      this.prisma.auditLog.count({ where: { tenantId, memberId } }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        skip,
        take,
      },
    };
  }

  async getUserHistory(tenantId: string, userId: string, skip = 0, take = 20) {
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId, userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          description: true,
          createdAt: true,
          userId: true,
        },
      }),
      this.prisma.auditLog.count({ where: { tenantId, userId } }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        skip,
        take,
      },
    };
  }
}
