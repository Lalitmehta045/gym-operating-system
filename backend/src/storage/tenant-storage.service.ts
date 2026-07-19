import { Inject, Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { WhatsappService } from '../whatsapp/services/whatsapp.service.js';
import { NotificationType } from '../notifications/dto/notification-type.enum.js';

export const STORAGE_LIMITS = {
  STARTER: 5 * 1024 * 1024 * 1024, // 5 GB
  GROWTH: 20 * 1024 * 1024 * 1024, // 20 GB
  ENTERPRISE: 100 * 1024 * 1024 * 1024, // 100 GB
  DEFAULT: 1 * 1024 * 1024 * 1024, // 1 GB fallback
};

@Injectable()
export class TenantStorageService {
  private readonly logger = new Logger(TenantStorageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly whatsapp: WhatsappService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getTenantStorage(tenantId: string) {
    const cacheKey = `tenant-storage:${tenantId}`;
    let storage = await this.cacheManager.get<any>(cacheKey);
    if (storage) return storage;

    storage = await this.prisma.tenantStorage.findUnique({
      where: { tenantId },
    });

    if (storage) {
      await this.cacheManager.set(cacheKey, storage, 300_000);
      return storage;
    }

    return this.calculateTenantStorage(tenantId, false);
  }

  async invalidateStorageCache(tenantId: string) {
    await this.cacheManager.del(`tenant-storage:${tenantId}`);
  }

  async getStorageLimitForTenant(tenantId: string): Promise<number> {
    const tenantSub = await this.prisma.tenantSubscription.findFirst({
      where: {
        tenantId,
        status: { in: ['ACTIVE', 'TRIAL'] },
      },
      include: { platformPlan: true },
    });

    if (!tenantSub || !tenantSub.platformPlan) {
      return STORAGE_LIMITS.DEFAULT;
    }

    const planName = tenantSub.platformPlan.name.toLowerCase();
    if (planName.includes('enterprise')) return STORAGE_LIMITS.ENTERPRISE;
    if (planName.includes('growth') || planName.includes('pro')) return STORAGE_LIMITS.GROWTH;
    if (planName.includes('starter') || planName.includes('basic')) return STORAGE_LIMITS.STARTER;
    
    return STORAGE_LIMITS.STARTER; // Default if unmatched
  }

  async calculateTenantStorage(tenantId: string, persist = true) {
    const limit = await this.getStorageLimitForTenant(tenantId);

    const mediaGroups = await this.prisma.media.groupBy({
      by: ['type'],
      where: { tenantId, deletedAt: null },
      _sum: { size: true },
      _count: { _all: true },
    });

    let totalFiles = 0;
    let totalImages = 0;
    let totalDocuments = 0;
    let usedBytes = 0;

    for (const group of mediaGroups) {
      const count = group._count._all;
      usedBytes += group._sum.size || 0;
      totalFiles += count;
      if (group.type === 'IMAGE') totalImages = count;
      else if (group.type === 'DOCUMENT') totalDocuments = count;
    }

    let storage;
    if (persist) {
      storage = await this.prisma.tenantStorage.upsert({
        where: { tenantId },
        update: {
          usedStorageBytes: usedBytes,
          storageLimitBytes: limit,
          totalFiles,
          totalImages,
          totalDocuments,
          lastCalculatedAt: new Date(),
        },
        create: {
          tenantId,
          usedStorageBytes: usedBytes,
          storageLimitBytes: limit,
          totalFiles,
          totalImages,
          totalDocuments,
          lastCalculatedAt: new Date(),
        },
      });

      await this.checkQuotas(tenantId, storage.usedStorageBytes, storage.storageLimitBytes);
    } else {
      storage = {
        tenantId,
        usedStorageBytes: usedBytes,
        storageLimitBytes: limit,
        totalFiles,
        totalImages,
        totalDocuments,
        lastCalculatedAt: new Date(),
      };
    }

    await this.cacheManager.set(`tenant-storage:${tenantId}`, storage, 300_000);
    return storage;
  }

  async validateUpload(tenantId: string, fileSize: number): Promise<void> {
    const storage = await this.prisma.tenantStorage.findUnique({
      where: { tenantId },
    });

    if (!storage) {
      await this.calculateTenantStorage(tenantId);
      return this.validateUpload(tenantId, fileSize);
    }

    if (storage.usedStorageBytes + fileSize > storage.storageLimitBytes) {
      throw new BadRequestException('Storage quota exceeded. Please upgrade your plan.');
    }
  }

  async incrementStorage(tenantId: string, size: number, type: string) {
    await this.prisma.tenantStorage.update({
      where: { tenantId },
      data: {
        usedStorageBytes: { increment: size },
        totalFiles: { increment: 1 },
        totalImages: type === 'IMAGE' ? { increment: 1 } : undefined,
        totalDocuments: type === 'DOCUMENT' ? { increment: 1 } : undefined,
      },
    });
  }

  private async checkQuotas(tenantId: string, used: number, limit: number) {
    const percentage = (used / limit) * 100;

    let warningLevel: number | null = null;
    if (percentage >= 100) warningLevel = 100;
    else if (percentage >= 90) warningLevel = 90;
    else if (percentage >= 80) warningLevel = 80;

    if (!warningLevel) return;

    // Send notifications if reached threshold
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return;

    // Find the owner to notify
    const owner = await this.prisma.user.findFirst({
      where: { tenantId, role: 'OWNER', isActive: true },
    });

    if (owner) {
      const message = warningLevel >= 100 
        ? 'Your storage quota is 100% full. Uploads are blocked. Please upgrade your plan.'
        : `Your storage is ${warningLevel}% full. Consider upgrading your plan soon.`;

      await this.notifications.createNotification({
        tenantId,
        type: NotificationType.SYSTEM,
        title: 'Storage Quota Warning',
        message,
      });

      if (tenant.phone) {
        await this.whatsapp.sendStorageWarning(tenantId, warningLevel).catch(() => {});
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async recalculateAllTenants() {
    const startedAt = Date.now();
    this.logger.log('Starting daily storage recalculation for all tenants...');

    try {
      // 1. Group by tenantId and type to calculate storage for ALL tenants at once
      const mediaGroups = await this.prisma.media.groupBy({
        by: ['tenantId', 'type'],
        where: { deletedAt: null },
        _sum: { size: true },
        _count: { _all: true },
      });

      const tenantStorageMap = new Map<string, {
        usedBytes: number;
        totalFiles: number;
        totalImages: number;
        totalDocuments: number;
      }>();

      for (const group of mediaGroups) {
        if (!group.tenantId) continue;
        
        const existing = tenantStorageMap.get(group.tenantId) || {
          usedBytes: 0,
          totalFiles: 0,
          totalImages: 0,
          totalDocuments: 0,
        };

        const count = group._count._all;
        existing.usedBytes += Number(group._sum.size || 0);
        existing.totalFiles += count;
        if (group.type === 'IMAGE') existing.totalImages += count;
        else if (group.type === 'DOCUMENT') existing.totalDocuments += count;

        tenantStorageMap.set(group.tenantId, existing);
      }

      // Zero out any existing storage records that no longer have media files
      const activeStorage = await this.prisma.tenantStorage.findMany({
        select: { tenantId: true },
      });

      for (const { tenantId } of activeStorage) {
        if (!tenantStorageMap.has(tenantId)) {
          tenantStorageMap.set(tenantId, {
            usedBytes: 0,
            totalFiles: 0,
            totalImages: 0,
            totalDocuments: 0,
          });
        }
      }

      // 2. Run one transaction to update all tenantStorage records
      const updateOps: any[] = [];
      const cacheOps: Promise<any>[] = [];
      for (const [tenantId, stats] of tenantStorageMap.entries()) {
        updateOps.push(
          this.prisma.tenantStorage.updateMany({
            where: { tenantId },
            data: {
              usedStorageBytes: stats.usedBytes,
              totalFiles: stats.totalFiles,
              totalImages: stats.totalImages,
              totalDocuments: stats.totalDocuments,
              updatedAt: new Date(),
            },
          })
        );
        cacheOps.push(this.cacheManager.del(`tenant-storage:${tenantId}`).catch(() => {}));
      }

      if (updateOps.length > 0) {
        await this.prisma.$transaction(updateOps);
        await Promise.all(cacheOps);
      }

      const duration = Date.now() - startedAt;
      this.logger.log(`Recalculated storage for ${tenantStorageMap.size} tenants in ${duration} ms`);
    } catch (err) {
      this.logger.error('Failed to recalculate daily storage', err);
    }
  }

  async getPlatformStorage(page = 1, limit = 50) {
    const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
    const pageSize = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 50;
    const skip = (currentPage - 1) * pageSize;

    const [storageStats, total, totals] = await Promise.all([
      this.prisma.tenantStorage.findMany({
        include: {
          tenant: {
            select: { name: true },
          },
        },
        orderBy: { usedStorageBytes: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.tenantStorage.count(),
      this.prisma.tenantStorage.aggregate({
        _sum: {
          usedStorageBytes: true,
          storageLimitBytes: true,
          totalFiles: true,
        },
      }),
    ]);

    const tenantIds = storageStats.map((stat) => stat.tenantId);
    const subscriptions = tenantIds.length
      ? await this.prisma.tenantSubscription.findMany({
          where: {
            tenantId: { in: tenantIds },
            status: { in: ['ACTIVE', 'TRIAL'] },
          },
          include: { platformPlan: true },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    const subscriptionByTenant = new Map<string, any>();
    for (const subscription of subscriptions) {
      if (!subscriptionByTenant.has(subscription.tenantId)) {
        subscriptionByTenant.set(subscription.tenantId, subscription);
      }
    }

    const tenantData = storageStats.map((stat) => {
      const sub = subscriptionByTenant.get(stat.tenantId);

      return {
        tenantId: stat.tenantId,
        tenantName: stat.tenant?.name || 'Unknown',
        planName: sub?.platformPlan?.name || 'Starter',
        usedBytes: stat.usedStorageBytes,
        limitBytes: stat.storageLimitBytes,
        usagePercent: ((stat.usedStorageBytes / stat.storageLimitBytes) * 100).toFixed(1),
        fileCount: stat.totalFiles,
      };
    });

    return {
      totalUsed: totals._sum.usedStorageBytes || 0,
      totalLimit: totals._sum.storageLimitBytes || 0,
      totalFiles: totals._sum.totalFiles || 0,
      tenants: tenantData,
      total,
      page: currentPage,
      limit: pageSize,
    };
  }

  private async runWithConcurrency<T>(
    items: T[],
    limit: number,
    worker: (item: T) => Promise<void>,
  ): Promise<void> {
    let index = 0;
    const runners = Array.from(
      { length: Math.min(limit, items.length) },
      async () => {
        while (index < items.length) {
          const item = items[index++];
          await worker(item);
        }
      },
    );
    await Promise.all(runners);
  }
}
