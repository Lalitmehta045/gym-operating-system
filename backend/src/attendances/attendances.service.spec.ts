import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AttendanceService } from './services/attendances.service.js';
import { JwtService } from '@nestjs/jwt';

// Minimal mocked PrismaService with only used methods
const makePrismaMock = (overrides = {}) => {
  const defaultMock: any = {
    member: { findFirst: jest.fn() },
    attendance: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  return Object.assign(defaultMock, overrides);
};

describe('AttendanceService (validation & conflicts)', () => {
  let prisma: any;
  let jwt: any;
  let svc: AttendanceService;
  const tenantId = 't1';
  const userId = 'u1';
  const memberId = 'm1';

  beforeEach(() => {
    prisma = makePrismaMock();
    jwt = { verify: jest.fn() };
    svc = new AttendanceService(prisma, jwt);
  });

  test('duplicate check-in should be rejected', async () => {
    prisma.member.findFirst.mockResolvedValue({
      id: memberId,
      isActive: true,
      status: 'ACTIVE',
    });
    prisma.attendance.findFirst.mockResolvedValue({ id: 'a1' });

    await expect(svc.checkIn(tenantId, userId, memberId)).rejects.toThrow(
      BadRequestException,
    );
    await expect(svc.checkIn(tenantId, userId, memberId)).rejects.toThrow(
      'Member already checked-in for today',
    );
  });

  test('duplicate manual attendance should be rejected', async () => {
    prisma.member.findFirst.mockResolvedValue({
      id: memberId,
      isActive: true,
      status: 'ACTIVE',
    });
    prisma.attendance.findFirst.mockResolvedValue({ id: 'a1' });

    const dto = {
      memberId,
      attendanceDate: new Date().toISOString(),
      status: 'PRESENT',
    } as any;
    await expect(
      svc.createManualAttendance(tenantId, userId, dto),
    ).rejects.toThrow(BadRequestException);
    await expect(
      svc.createManualAttendance(tenantId, userId, dto),
    ).rejects.toThrow('Attendance for member on this date already exists');
  });

  test('invalid member status should be rejected for check-in', async () => {
    prisma.member.findFirst.mockResolvedValue({
      id: memberId,
      isActive: true,
      status: 'SUSPENDED',
    });

    await expect(svc.checkIn(tenantId, userId, memberId)).rejects.toThrow(
      BadRequestException,
    );
    await expect(svc.checkIn(tenantId, userId, memberId)).rejects.toThrow(
      'Member status must be ACTIVE',
    );
  });

  test('invalid member status should be rejected for manual attendance', async () => {
    prisma.member.findFirst.mockResolvedValue({
      id: memberId,
      isActive: true,
      status: 'EXPIRED',
    });
    const dto = {
      memberId,
      attendanceDate: new Date().toISOString(),
      status: 'PRESENT',
    } as any;

    await expect(
      svc.createManualAttendance(tenantId, userId, dto),
    ).rejects.toThrow(BadRequestException);
    await expect(
      svc.createManualAttendance(tenantId, userId, dto),
    ).rejects.toThrow('Member status must be ACTIVE');
  });

  test('duplicate checkout should be rejected', async () => {
    prisma.attendance.findFirst.mockResolvedValue({
      id: 'a1',
      tenantId,
      checkOutAt: new Date(),
      checkInAt: new Date(Date.now() - 10000),
    });

    await expect(svc.checkOut(tenantId, 'a1', userId)).rejects.toThrow(
      BadRequestException,
    );
    await expect(svc.checkOut(tenantId, 'a1', userId)).rejects.toThrow(
      'Attendance already checked-out',
    );
  });

  test('check-out earlier than check-in should be rejected', async () => {
    // attendance has a checkInAt in the future
    const future = new Date(Date.now() + 10000);
    prisma.attendance.findFirst.mockResolvedValue({
      id: 'a2',
      tenantId,
      checkOutAt: null,
      checkInAt: future,
    });

    await expect(svc.checkOut(tenantId, 'a2', userId)).rejects.toThrow(
      BadRequestException,
    );
    await expect(svc.checkOut(tenantId, 'a2', userId)).rejects.toThrow(
      'Check-out time must be after check-in time',
    );
  });

  describe('processQrScan', () => {
    test('valid scan creates attendance', async () => {
      jwt.verify.mockReturnValue({ tenantId, memberId });
      prisma.member.findFirst.mockResolvedValue({
        id: memberId,
        isActive: true,
        status: 'ACTIVE',
      });
      prisma.attendance.findFirst.mockResolvedValue(null);
      prisma.attendance.create.mockResolvedValue({
        id: 'a1',
        tenantId,
        memberId,
      });

      const res = await svc.processQrScan(tenantId, userId, 'valid.token.here');
      expect(res.id).toBe('a1');
      expect(prisma.attendance.create).toHaveBeenCalled();
    });

    test('invalid signature/expired throws Unauthorized', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });
      await expect(
        svc.processQrScan(tenantId, userId, 'bad.token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    test('cross-tenant attempt throws Forbidden', async () => {
      jwt.verify.mockReturnValue({ tenantId: 't2', memberId });
      await expect(
        svc.processQrScan(tenantId, userId, 'token'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        svc.processQrScan(tenantId, userId, 'token'),
      ).rejects.toThrow('QR code belongs to a different tenant');
    });

    test('duplicate attendance returns ConflictException', async () => {
      jwt.verify.mockReturnValue({ tenantId, memberId });
      prisma.member.findFirst.mockResolvedValue({
        id: memberId,
        isActive: true,
        status: 'ACTIVE',
      });
      prisma.attendance.findFirst.mockResolvedValue({ id: 'a1' }); // Duplicate exists

      await expect(
        svc.processQrScan(tenantId, userId, 'token'),
      ).rejects.toThrow(ConflictException);
      await expect(
        svc.processQrScan(tenantId, userId, 'token'),
      ).rejects.toThrow('Already Checked In');
    });
  });
});
