import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from './audit.controller.js';
import { AuditService } from './audit.service.js';
import { Role, AuditEntity, AuditAction } from '../../generated/prisma/client.js';

describe('AuditController', () => {
  let controller: AuditController;
  let service: AuditService;

  const mockAuditService = {
    getLogs: jest.fn(),
    getMemberTimeline: jest.fn(),
    getUserHistory: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    tenantId: 'tenant-1',
    email: 'test@example.com',
    role: Role.OWNER,
  };

  const mockSuperAdmin = {
    ...mockUser,
    role: Role.SUPER_ADMIN,
    tenantId: undefined, // Super admin might not have tenantId
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    controller = module.get<AuditController>(AuditController);
    service = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLogs', () => {
    it('should call getLogs on service with tenantId for OWNER', async () => {
      mockAuditService.getLogs.mockResolvedValue({ data: [], meta: {} });
      await controller.getLogs(mockUser, AuditEntity.MEMBER, AuditAction.CREATE, undefined, undefined, undefined, undefined, undefined, '0', '20');
      expect(service.getLogs).toHaveBeenCalledWith('tenant-1', expect.objectContaining({ entity: AuditEntity.MEMBER, action: AuditAction.CREATE }));
    });

    it('should call getLogs on service without tenantId for SUPER_ADMIN', async () => {
      mockAuditService.getLogs.mockResolvedValue({ data: [], meta: {} });
      await controller.getLogs(mockSuperAdmin, undefined, undefined, undefined, undefined, undefined, undefined, undefined, '0', '20');
      expect(service.getLogs).toHaveBeenCalledWith(null, expect.any(Object));
    });
  });

  describe('getPlatformLogs', () => {
    it('should call getLogs with null tenantId', async () => {
      mockAuditService.getLogs.mockResolvedValue({ data: [], meta: {} });
      await controller.getPlatformLogs(AuditEntity.MEMBER, undefined, undefined, undefined, undefined, undefined, undefined, '0', '20');
      expect(service.getLogs).toHaveBeenCalledWith(null, expect.objectContaining({ entity: AuditEntity.MEMBER }));
    });
  });

  describe('getMemberTimeline', () => {
    it('should return member timeline', async () => {
      mockAuditService.getMemberTimeline.mockResolvedValue({ data: [], meta: {} });
      await controller.getMemberTimeline(mockUser, 'member-1', '0', '20');
      expect(service.getMemberTimeline).toHaveBeenCalledWith('tenant-1', 'member-1', 0, 20);
    });
  });

  describe('getUserHistory', () => {
    it('should return user history scoped to tenant for OWNER', async () => {
      mockAuditService.getUserHistory.mockResolvedValue({ data: [], meta: {} });
      await controller.getUserHistory(mockUser, 'target-user-1', '0', '20');
      expect(service.getUserHistory).toHaveBeenCalledWith('tenant-1', 'target-user-1', 0, 20);
    });

    it('should return user history without tenant scope for SUPER_ADMIN', async () => {
      mockAuditService.getLogs.mockResolvedValue({ data: [], meta: {} });
      await controller.getUserHistory(mockSuperAdmin, 'target-user-1', '0', '20');
      expect(service.getLogs).toHaveBeenCalledWith(null, expect.objectContaining({ userId: 'target-user-1' }));
    });
  });
});
