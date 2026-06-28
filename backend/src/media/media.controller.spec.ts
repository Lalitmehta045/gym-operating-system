import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller.js';
import { MediaService } from './media.service.js';
import { BadRequestException } from '@nestjs/common';
import { Role, MediaCategory, MediaType } from '../../generated/prisma/client.js';

describe('MediaController', () => {
  let controller: MediaController;
  let service: MediaService;

  const mockMediaService = {
    createMedia: jest.fn(),
    getMemberGallery: jest.fn(),
    deleteMedia: jest.fn(),
  };

  const mockUser = {
    tenantId: 'tenant-1',
    sub: 'user-1',
    role: Role.OWNER,
  };

  const mockFile = {
    originalname: 'test.jpg',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('test'),
  } as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: MediaService,
          useValue: mockMediaService,
        },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
    service = module.get<MediaService>(MediaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Single upload & Profile photo replacement', () => {
    it('should upload a profile photo', async () => {
      const result = { id: 'media-1', category: MediaCategory.MEMBER_PROFILE };
      mockMediaService.createMedia.mockResolvedValue(result);

      expect(await controller.uploadProfilePhoto('member-1', mockFile, mockUser as any)).toEqual(result);
      expect(service.createMedia).toHaveBeenCalledWith(mockFile, {
        tenantId: mockUser.tenantId,
        memberId: 'member-1',
        uploadedById: mockUser.sub,
        category: MediaCategory.MEMBER_PROFILE,
      });
    });

    it('should throw error if file is missing', async () => {
      await expect(controller.uploadProfilePhoto('member-1', undefined as any, mockUser as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('Multiple upload & Gallery CRUD', () => {
    it('should upload multiple gallery images', async () => {
      const files = [mockFile, mockFile];
      const result = { id: 'media-1', category: MediaCategory.MEMBER_GALLERY };
      mockMediaService.createMedia.mockResolvedValue(result);

      const response = await controller.uploadGallery('member-1', files, mockUser as any);
      expect(response).toHaveLength(2);
      expect(service.createMedia).toHaveBeenCalledTimes(2);
    });

    it('should fetch gallery images', async () => {
      const result = [{ id: 'media-1' }];
      mockMediaService.getMemberGallery.mockResolvedValue(result);

      expect(await controller.getGallery('member-1', mockUser as any)).toEqual(result);
      expect(service.getMemberGallery).toHaveBeenCalledWith(mockUser.tenantId, 'member-1');
    });

    it('should soft delete gallery image and call storage cleanup', async () => {
      mockMediaService.deleteMedia.mockResolvedValue({ success: true });

      expect(await controller.deleteGalleryMedia('media-1', mockUser as any)).toEqual({ success: true });
      expect(service.deleteMedia).toHaveBeenCalledWith(mockUser.tenantId, 'media-1');
    });
  });

  describe('Authorization', () => {
    it('should set category based on role for avatar upload (OWNER)', async () => {
      mockMediaService.createMedia.mockResolvedValue({});
      await controller.uploadAvatar(mockFile, mockUser as any);
      
      expect(service.createMedia).toHaveBeenCalledWith(mockFile, {
        tenantId: mockUser.tenantId,
        uploadedById: mockUser.sub,
        category: MediaCategory.OWNER_AVATAR,
      });
    });

    it('should set category based on role for avatar upload (STAFF)', async () => {
      mockMediaService.createMedia.mockResolvedValue({});
      const staffUser = { ...mockUser, role: Role.TRAINER };
      await controller.uploadAvatar(mockFile, staffUser as any);
      
      expect(service.createMedia).toHaveBeenCalledWith(mockFile, {
        tenantId: staffUser.tenantId,
        uploadedById: staffUser.sub,
        category: MediaCategory.STAFF_AVATAR,
      });
    });
  });
});
