import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService as AwsStorageService } from './storage.service.js';
import { TenantStorageService } from '../storage/tenant-storage.service.js';
import { MediaType, MediaCategory, Prisma } from '../../generated/prisma/client.js';
import { ImageProcessingProcessor } from './processors/image-processing.processor.js';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: AwsStorageService,
    private tenantStorageService: TenantStorageService,
    private imageProcessor: ImageProcessingProcessor,
  ) {}

  async createMedia(
    file: Express.Multer.File,
    data: {
      tenantId: string;
      memberId?: string;
      uploadedById?: string;
      category: MediaCategory;
    }
  ) {
    let type: MediaType = MediaType.OTHER;
    if (file.mimetype.startsWith('image/')) type = MediaType.IMAGE;
    else if (file.mimetype.startsWith('video/')) type = MediaType.VIDEO;
    else if (file.mimetype.includes('pdf') || file.mimetype.includes('document')) type = MediaType.DOCUMENT;
    else throw new BadRequestException(`Unsupported MIME type: ${file.mimetype}`);

    const { tenantId, memberId, uploadedById, category } = data;

    // File size validations
    const sizeInMB = file.size / (1024 * 1024);
    if ((category === MediaCategory.MEMBER_PROFILE || category === MediaCategory.OWNER_AVATAR || category === MediaCategory.STAFF_AVATAR || category === MediaCategory.GYM_LOGO) && sizeInMB > 2) {
      throw new BadRequestException('Profile/Logo images cannot exceed 2MB.');
    }
    if (category === MediaCategory.MEMBER_GALLERY && sizeInMB > 5) {
      throw new BadRequestException('Gallery images cannot exceed 5MB.');
    }
    if ((category === MediaCategory.MEDICAL_DOCUMENT || category === MediaCategory.IDENTITY_DOCUMENT || category === MediaCategory.INVOICE_ATTACHMENT) && sizeInMB > 10) {
      throw new BadRequestException('Documents cannot exceed 10MB.');
    }

    const folder = this.getFolderForCategory(category, tenantId, memberId, uploadedById);

    // Validate storage quota before processing
    await this.tenantStorageService.validateUpload(tenantId, file.size);

    const storageKey = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder
    );

    if (type === MediaType.IMAGE) {
      const media = await this.prisma.media.create({
        data: {
          tenantId,
          memberId,
          uploadedById,
          type,
          category,
          originalName: file.originalname,
          fileName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          storageKey,
        },
      });

      // Process image in the background
      this.imageProcessor.process({
        mediaId: media.id,
        tenantId,
        storageKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        folder
      }).catch(err => {
        this.logger.error(`Failed to process image ${media.id}`, err.stack);
      });

      await this.tenantStorageService.incrementStorage(tenantId, file.size, type);
      await this.tenantStorageService.invalidateStorageCache(tenantId);
      return { status: 'processing', tempKey: storageKey, mediaId: media.id };
    } else {
      const publicUrl = this.storageService.getPublicUrl(storageKey);
      const media = await this.prisma.media.create({
        data: {
          tenantId,
          memberId,
          uploadedById,
          type,
          category,
          originalName: file.originalname,
          fileName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          storageKey,
          publicUrl,
        },
      });

      await this.tenantStorageService.incrementStorage(tenantId, file.size, type);
      await this.tenantStorageService.invalidateStorageCache(tenantId);
      return media;
    }
  }

  async getMemberGallery(tenantId: string, memberId: string, page = 1, limit = 20) {
    const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
    const pageSize = Number.isFinite(limit) && limit > 0 ? limit : 20;
    const skip = (currentPage - 1) * pageSize;
    const where = {
      tenantId,
      memberId,
      category: MediaCategory.MEMBER_GALLERY,
      deletedAt: null,
    };

    const [data, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        select: {
          id: true,
          type: true,
          category: true,
          originalName: true,
          fileName: true,
          mimeType: true,
          size: true,
          width: true,
          height: true,
          publicUrl: true,
          thumbnailUrl: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.media.count({ where }),
    ]);

    return { data, total, page: currentPage, limit: pageSize };
  }

  async deleteMedia(tenantId: string, mediaId: string) {
    const media = await this.prisma.media.findFirst({
      where: { id: mediaId, tenantId, deletedAt: null },
    });

    if (!media) {
      throw new BadRequestException('Media not found');
    }

    await this.prisma.media.update({
      where: { id: mediaId },
      data: { deletedAt: new Date() },
    });

    await this.tenantStorageService.incrementStorage(tenantId, -media.size, media.type);
    await this.tenantStorageService.invalidateStorageCache(tenantId);

    try {
      await this.storageService.deleteFile(media.storageKey);
      if (media.thumbnailUrl) {
        const folder = media.storageKey.substring(0, media.storageKey.lastIndexOf('/'));
        const thumbFilename = media.thumbnailUrl.split('/').pop();
        if (thumbFilename) {
          await this.storageService.deleteFile(`${folder}/thumbnails/${thumbFilename}`);
        }
      }
    } catch (err) {
      this.logger.error(`Failed to delete object from storage: ${err.message}`);
    }

    return { success: true };
  }

  private getFolderForCategory(category: MediaCategory, tenantId: string, memberId?: string, uploadedById?: string): string {
    switch (category) {
      case MediaCategory.GYM_LOGO:
        return `tenant/${tenantId}/gym/logo`;
      case MediaCategory.MEMBER_PROFILE:
        return `tenant/${tenantId}/members/${memberId}/profile`;
      case MediaCategory.MEMBER_GALLERY:
        return `tenant/${tenantId}/members/${memberId}/gallery`;
      case MediaCategory.MEDICAL_DOCUMENT:
      case MediaCategory.IDENTITY_DOCUMENT:
        return `tenant/${tenantId}/members/${memberId}/documents`;
      case MediaCategory.OWNER_AVATAR:
      case MediaCategory.STAFF_AVATAR:
        return `tenant/${tenantId}/staff/${uploadedById}/avatar`;
      default:
        return `tenant/${tenantId}/other`;
    }
  }
}
