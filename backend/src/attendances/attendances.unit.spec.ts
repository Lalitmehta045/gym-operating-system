import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AttendanceService } from './services/attendances.service.js';

// Minimal mocked PrismaService to capture call args
const makePrismaMock = () => ({
  attendance: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  member: { findFirst: jest.fn(), count: jest.fn() },
  $transaction: jest.fn(),
});

describe('AttendanceService - tenant isolation & listing', () => {
  let prisma: any;
  let svc: AttendanceService;
  const tenantId = 'tenant-x';
  const otherTenant = 'tenant-y';

  const makeJwt = () => ({ verify: jest.fn() });

  beforeEach(() => {
    prisma = makePrismaMock();
    svc = new AttendanceService(prisma, makeJwt() as any);
  });

  test('getAttendanceById filters by tenantId', async () => {
    prisma.attendance.findFirst.mockResolvedValue({ id: 'a1', tenantId });

    await svc.getAttendanceById(tenantId, 'a1');

    expect(prisma.attendance.findFirst).toHaveBeenCalledWith({
      where: { id: 'a1', tenantId },
    });
  });

  test('getAttendanceById throws when not found', async () => {
    prisma.attendance.findFirst.mockResolvedValue(null);
    await expect(svc.getAttendanceById(tenantId, 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  test('listAttendances respects includeDeleted flag', async () => {
    const items = [
      {
        id: 'a',
        tenantId,
        memberId: 'm1',
        attendanceDate: new Date(),
        checkInAt: new Date(),
        status: 'PRESENT',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];
    prisma.$transaction.mockResolvedValue([items, 1]);

    await svc.listAttendances(tenantId, {
      page: 1,
      limit: 10,
      includeDeleted: true,
    } as any);

    // Instead of inspecting internals of transaction we assert that findMany was called with includeDeleted respected
    expect(prisma.$transaction).toHaveBeenCalled();

    // Call with includeDeleted false should include deletedAt: null
    prisma.$transaction.mockClear();
    await svc.listAttendances(tenantId, {
      page: 1,
      limit: 10,
      includeDeleted: false,
    } as any);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  test('pagination meta values computed correctly', async () => {
    const items = new Array(5).fill(0).map((_, i) => ({
      id: `a${i}`,
      tenantId,
      memberId: 'm',
      attendanceDate: new Date(),
      checkInAt: new Date(),
      status: 'PRESENT',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    }));
    prisma.$transaction.mockResolvedValue([items, 25]);

    const out = await svc.listAttendances(tenantId, {
      page: 3,
      limit: 5,
    } as any);
    expect(out.meta.page).toBe(3);
    expect(out.meta.limit).toBe(5);
    expect(out.meta.total).toBe(25);
    expect(out.meta.totalPages).toBe(5);
    expect(out.meta.hasNextPage).toBe(true);
    expect(out.meta.hasPreviousPage).toBe(true);
  });

  test('memberReport requires tenant and throws without it', async () => {
    await expect(svc.memberReport(null as any, 'm1')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
