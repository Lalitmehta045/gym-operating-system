// ============================================================================
// MembershipPlansModule - Phase 2A membership plan architecture boundary
// ============================================================================

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { MembershipPlansController } from './controllers/membership-plans.controller.js';
import { MembershipPlansService } from './services/membership-plans.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [MembershipPlansController],
  providers: [MembershipPlansService],
})
export class MembershipPlansModule {}
