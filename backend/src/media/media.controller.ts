import { Controller, Post, Get, Delete, Param, Query, UseInterceptors, UploadedFile, UploadedFiles, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role, MediaCategory, AuditEntity, AuditAction } from '../../generated/prisma/client.js';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface.js';
import { AuditLog } from '../audit/decorators/audit-log.decorator.js';

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('media/upload')
  @Roles(Role.OWNER, Role.MANAGER)
  @UseInterceptors(FilesInterceptor('files', 10))
  @AuditLog(AuditEntity.MEDIA, AuditAction.UPLOAD, '📄 Document Uploaded')
  async uploadMedia(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('category') category: MediaCategory,
    @Body('memberId') memberId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    return Promise.all(
      files.map((file) =>
        this.mediaService.createMedia(file, {
          tenantId: user.tenantId!,
          memberId,
          uploadedById: user.sub,
          category: category || MediaCategory.OTHER,
        }),
      ),
    );
  }

  @Post('members/:id/profile-photo')
  @Roles(Role.OWNER, Role.MANAGER)
  @UseInterceptors(FileInterceptor('file'))
  @AuditLog(AuditEntity.MEMBER, AuditAction.UPLOAD, '📸 Profile Photo Uploaded')
  async uploadProfilePhoto(
    @Param('id') memberId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) throw new BadRequestException('File is required');
    return this.mediaService.createMedia(file, {
      tenantId: user.tenantId!,
      memberId,
      uploadedById: user.sub,
      category: MediaCategory.MEMBER_PROFILE,
    });
  }

  @Post('members/:id/gallery')
  @Roles(Role.OWNER, Role.MANAGER)
  @UseInterceptors(FilesInterceptor('files', 10))
  @AuditLog(AuditEntity.MEMBER, AuditAction.UPLOAD, '📷 Gallery Image Uploaded')
  async uploadGallery(
    @Param('id') memberId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: JwtPayload,
  ) {
    if (!files || files.length === 0) throw new BadRequestException('Files are required');
    return Promise.all(
      files.map((file) =>
        this.mediaService.createMedia(file, {
          tenantId: user.tenantId!,
          memberId,
          uploadedById: user.sub,
          category: MediaCategory.MEMBER_GALLERY,
        }),
      ),
    );
  }

  @Get('members/:id/gallery')
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  async getGallery(
    @Param('id') memberId: string,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.mediaService.getMemberGallery(
      user.tenantId!,
      memberId,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Delete('members/:id/gallery/:mediaId')
  @Roles(Role.OWNER, Role.MANAGER)
  @AuditLog(AuditEntity.MEDIA, AuditAction.DELETE, '🗑️ Document Deleted')
  async deleteGalleryMedia(
    @Param('mediaId') mediaId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.mediaService.deleteMedia(user.tenantId!, mediaId);
  }

  @Post('settings/gym/logo')
  @Roles(Role.OWNER)
  @UseInterceptors(FileInterceptor('file'))
  @AuditLog(AuditEntity.GYM, AuditAction.UPDATE, '🖼️ Gym Logo Updated')
  async uploadGymLogo(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) throw new BadRequestException('File is required');
    return this.mediaService.createMedia(file, {
      tenantId: user.tenantId!,
      uploadedById: user.sub,
      category: MediaCategory.GYM_LOGO,
    });
  }

  @Post('profile/avatar')
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  @UseInterceptors(FileInterceptor('file'))
  @AuditLog(AuditEntity.PROFILE, AuditAction.UPLOAD, '📸 Profile Photo Uploaded')
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) throw new BadRequestException('File is required');
    const category = user.role === Role.OWNER ? MediaCategory.OWNER_AVATAR : MediaCategory.STAFF_AVATAR;
    return this.mediaService.createMedia(file, {
      tenantId: user.tenantId!,
      uploadedById: user.sub,
      category,
    });
  }

}
