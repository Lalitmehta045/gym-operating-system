import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditEntity, AuditAction } from '../../generated/prisma/client.js';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: PrismaService;

  const mockPrismaService = {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLog', () => {
    it('should create an audit log successfully', async () => {
      const dto = {
        tenantId: 'tenant-1',
        userId: 'user-1',
        entity: AuditEntity.MEMBER,
        entityId: 'member-1',
        action: AuditAction.CREATE,
        description: 'Member Created',
      };

      const mockLog = { id: 'log-1', ...dto, createdAt: new Date() };
      mockPrismaService.auditLog.create.mockResolvedValue(mockLog);

      const result = await service.createLog(dto);

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          memberId: undefined,
          metadata: null,
          ipAddress: null,
          userAgent: null,
        },
      });
      expect(result).toEqual(mockLog);
    });

    it('should return null if creation fails', async () => {
      mockPrismaService.auditLog.create.mockRejectedValue(new Error('DB Error'));

      const result = await service.createLog({
        tenantId: 'tenant-1',
        userId: 'user-1',
        entity: AuditEntity.MEMBER,
        entityId: 'member-1',
        action: AuditAction.CREATE,
        description: 'Member Created',
      });

      expect(result).toBeNull();
    });
  });

  describe('getLogs', () => {
    it('should return paginated logs with filters', async () => {
      const mockLogs = [{ id: '1' }, { id: '2' }];
      mockPrismaService.auditLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaService.auditLog.count.mockResolvedValue(2);

      const result = await service.getLogs('tenant-1', {
        skip: 0,
        take: 10,
        entity: AuditEntity.MEMBER,
      });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1', entity: AuditEntity.MEMBER }),
        skip: 0,
        take: 10,
      }));
      expect(result.data).toEqual(mockLogs);
      expect(result.meta.total).toBe(2);
    });
  });

  describe('getMemberTimeline', () => {
    it('should return member timeline logs', async () => {
      const mockLogs = [{ id: '1' }];
      mockPrismaService.auditLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaService.auditLog.count.mockResolvedValue(1);

      const result = await service.getMemberTimeline('tenant-1', 'member-1', 0, 20);

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', memberId: 'member-1' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
      expect(result.data).toEqual(mockLogs);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getUserHistory', () => {
    it('should return user history logs', async () => {
      const mockLogs = [{ id: '1' }];
      mockPrismaService.auditLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaService.auditLog.count.mockResolvedValue(1);

      const result = await service.getUserHistory('tenant-1', 'user-1', 0, 20);

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
      expect(result.data).toEqual(mockLogs);
      expect(result.meta.total).toBe(1);
    });
  });
});
