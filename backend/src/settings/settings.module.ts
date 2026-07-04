import { Module } from '@nestjs/common';
import { IntegrationSettingsController } from './controllers/integration-settings.controller.js';
import { IntegrationSettingsService } from './services/integration-settings.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [IntegrationSettingsController],
  providers: [IntegrationSettingsService],
  exports: [IntegrationSettingsService],
})
export class SettingsModule {}
