import { Module } from '@nestjs/common';
import { StaffService } from './services/staff.service.js';
import { StaffController } from './controllers/staff.controller.js';

@Module({
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
