import { ForbiddenException } from '@nestjs/common';
import { AttendanceService } from './services/attendances.service';

// lightweight mocks for Prisma
const makePrisma = () => ({
  attendance: {
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
    groupBy: jest.fn(),
  },
  member: { findFirst: jest.fn(), count: jest.fn() },
  $transaction: jest.fn(),
});

describe('Attendance Reports (unit)', () => {
  let svc: AttendanceService;
  let prisma: any;
  const tenantId = 't-local';
  const memberId = 'm-local';

  beforeEach(() => {
    prisma = makePrisma();
    svc = new AttendanceService(prisma);
  });

  test('listAttendances pagination', async () => {
    const items = [
      {
        id: 'a',
        tenantId,
        memberId,
        attendanceDate: new Date(),
        checkInAt: new Date(),
        status: 'PRESENT',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];
    prisma.$transaction.mockResolvedValue([items, 1]);

    const out = await svc.listAttendances(tenantId, {
      page: 1,
      limit: 10,
    } as any);
    expect(out.meta.total).toBe(1);
    expect(out.data.length).toBe(1);
  });

  test('memberReport requires tenant and returns aggregates', async () => {
    prisma.member.findFirst.mockResolvedValue({
      id: memberId,
      firstName: 'A',
      lastName: 'B',
    });
    prisma.attendance.groupBy.mockResolvedValue([
      { status: 'PRESENT', _count: 4 },
      { status: 'ABSENT', _count: 1 },
      { status: 'LATE', _count: 0 },
      { status: 'MISSED', _count: 0 },
    ]);
    prisma.attendance.findFirst.mockResolvedValue({
      attendanceDate: new Date('2026-06-01'),
    });

    const rpt = await svc.memberReport(tenantId, memberId);
    expect(rpt.totalPresent).toBe(4);
    expect(rpt.memberName).toContain('A');
  });

  test('dailyReport requires tenant', async () => {
    await expect(svc.dailyReport(null as any)).rejects.toThrow(
      ForbiddenException,
    );
  });

  test('monthlyReport aggregates counts', async () => {
    prisma.attendance.groupBy.mockResolvedValue([
      { status: 'PRESENT', _count: 30 },
      { status: 'ABSENT', _count: 5 },
      { status: 'LATE', _count: 2 },
      { status: 'MISSED', _count: 1 },
    ]);

    const rpt = await svc.monthlyReport(tenantId);
    expect(rpt.totalPresent).toBe(30);
    expect(rpt.averageDailyAttendance).toBeGreaterThan(0);
  });
});
