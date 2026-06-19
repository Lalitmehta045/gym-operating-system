// ============================================================================
// MembersModule - Phase 2B
// ============================================================================

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { MembersController } from './controllers/members.controller.js';
import { MembersService } from './services/members.service.js';
import { AuthModule } from '../auth/auth.module.js';

import { WhatsappModule } from '../whatsapp/whatsapp.module.js';

@Module({
  imports: [PrismaModule, WhatsappModule, AuthModule],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
