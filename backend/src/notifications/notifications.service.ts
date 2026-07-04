import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';
import { NotificationType } from './dto/notification-type.enum.js';
import { NotificationQueryDto } from './dto/notification-query.dto.js';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(data: {
    tenantId: string;
    memberId?: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: any;
  }) {
    return this.prisma.notification.create({
      data: {
        tenantId: data.tenantId,
        memberId: data.memberId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata ?? null,
      },
    });
  }

  async listNotifications(tenantId: string, query: NotificationQueryDto) {
    const { page = 1, limit = 10, type, isRead } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      ...(type && { type }),
      ...(isRead !== undefined && { isRead: isRead === 'true' }),
    };

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { type: 'asc' }],
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          isRead: true,
          createdAt: true,
          memberId: true,
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(tenantId: string) {
    const count = await this.prisma.notification.count({
      where: {
        tenantId,
        isRead: false,
      },
    });

    return { count };
  }

  async getNotificationById(tenantId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, tenantId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async markAsRead(tenantId: string, id: string) {
    const result = await this.prisma.notification.updateMany({
      where: { id, tenantId },
      data: { isRead: true },
    });

    if (result.count === 0) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return this.getNotificationById(tenantId, id);
  }

  async markAllAsRead(tenantId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        tenantId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { updatedCount: result.count };
  }
}
