// ============================================================================
// Attendances Module - Phase 4A
// ============================================================================

import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { AttendanceService } from './services/attendances.service.js';
import { AttendancesController } from './attendances.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AttendancesController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendancesModule {}
