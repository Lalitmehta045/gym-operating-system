import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService as AwsStorageService } from './storage.service.js';
import { TenantStorageService } from '../storage/tenant-storage.service.js';
import { MediaType, MediaCategory, Prisma } from '../../generated/prisma/client.js';
import sharp from 'sharp';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: AwsStorageService,
    private tenantStorageService: TenantStorageService,
  ) {}

  async processAndUploadImage(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string,
  ) {
    let processedBuffer = fileBuffer;
    let finalMimeType = mimeType;
    let finalExt = originalName;
    let width: number | null = null;
    let height: number | null = null;
    let thumbnailBuffer: Buffer | null = null;

    if (mimeType.startsWith('image/')) {
      try {
        const image = sharp(fileBuffer);
        const metadata = await image.metadata();
        width = metadata.width || null;
        height = metadata.height || null;

        processedBuffer = await image
          .webp({ quality: 80 })
          .toBuffer();
        
        finalMimeType = 'image/webp';
        finalExt = originalName.replace(/\.[^/.]+$/, "") + '.webp';

        thumbnailBuffer = await sharp(fileBuffer)
          .resize(200, 200, { fit: 'cover' })
          .webp({ quality: 70 })
          .toBuffer();

      } catch (error) {
        this.logger.error(`Error processing image: ${error.message}`);
      }
    }
    const storageKey = await this.storageService.uploadFile(processedBuffer, finalExt, finalMimeType, folder);
    const publicUrl = this.storageService.getPublicUrl(storageKey);

    let thumbnailUrl: string | null = null;
    if (thumbnailBuffer) {
      const thumbKey = await this.storageService.uploadFile(thumbnailBuffer, `thumb_${finalExt}`, finalMimeType, `${folder}/thumbnails`);
      thumbnailUrl = this.storageService.getPublicUrl(thumbKey);
    }

    return {
      storageKey,
      publicUrl,
      thumbnailUrl,
      width,
      height,
      mimeType: finalMimeType,
      fileName: finalExt,
      size: processedBuffer.length,
    };
  }

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

    const processed = await this.processAndUploadImage(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder
    );

    const media = await this.prisma.media.create({
      data: {
        tenantId,
        memberId,
        uploadedById,
        type,
        category,
        originalName: file.originalname,
        fileName: processed.fileName,
        mimeType: processed.mimeType,
        size: processed.size,
        width: processed.width,
        height: processed.height,
        storageKey: processed.storageKey,
        publicUrl: processed.publicUrl,
        thumbnailUrl: processed.thumbnailUrl,
      },
    });

    // Increment tenant storage
    await this.tenantStorageService.incrementStorage(tenantId, processed.size, type);

    return media;
  }

  async getMemberGallery(tenantId: string, memberId: string) {
    return this.prisma.media.findMany({
      where: {
        tenantId,
        memberId,
        category: MediaCategory.MEMBER_GALLERY,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
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

