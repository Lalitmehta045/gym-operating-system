import { Injectable, Logger, BadRequestException } from '@nestjs/common';
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
  ) {}

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

  async calculateTenantStorage(tenantId: string) {
    const limit = await this.getStorageLimitForTenant(tenantId);
    
    const media = await this.prisma.media.findMany({
      where: { tenantId, deletedAt: null },
      select: { size: true, type: true },
    });

    let totalFiles = 0;
    let totalImages = 0;
    let totalDocuments = 0;
    let usedBytes = 0;

    for (const file of media) {
      usedBytes += file.size || 0;
      totalFiles++;
      if (file.type === 'IMAGE') totalImages++;
      else if (file.type === 'DOCUMENT') totalDocuments++;
    }

    const storage = await this.prisma.tenantStorage.upsert({
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
        await this.whatsapp.sendMessage(tenant.phone, message).catch(() => {});
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async recalculateAllTenants() {
    this.logger.log('Starting daily storage recalculation for all tenants...');
    const tenants = await this.prisma.tenant.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    for (const t of tenants) {
      try {
        await this.calculateTenantStorage(t.id);
      } catch (err) {
        this.logger.error(`Failed to calculate storage for tenant ${t.id}`, err);
      }
    }
    this.logger.log('Finished daily storage recalculation.');
  }

  async getPlatformStorage() {
    const storageStats = await this.prisma.tenantStorage.findMany({
      include: {
        tenant: {
          select: { name: true },
        },
      },
      orderBy: { usedStorageBytes: 'desc' },
    });

    let totalUsed = 0;
    let totalLimit = 0;
    let totalFiles = 0;

    const tenantData = await Promise.all(storageStats.map(async stat => {
      totalUsed += stat.usedStorageBytes;
      totalLimit += stat.storageLimitBytes;
      totalFiles += stat.totalFiles;
      
      const sub = await this.prisma.tenantSubscription.findFirst({
        where: { tenantId: stat.tenantId, status: { in: ['ACTIVE', 'TRIAL'] } },
        include: { platformPlan: true }
      });
      
      return {
        tenantId: stat.tenantId,
        tenantName: stat.tenant?.name || 'Unknown',
        planName: sub?.platformPlan?.name || 'Starter',
        usedBytes: stat.usedStorageBytes,
        limitBytes: stat.storageLimitBytes,
        usagePercent: ((stat.usedStorageBytes / stat.storageLimitBytes) * 100).toFixed(1),
        fileCount: stat.totalFiles,
      };
    }));

    return {
      totalUsed,
      totalLimit,
      totalFiles,
      tenants: tenantData,
    };
  }
}
