import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { IntegrationSettingsService } from '../services/integration-settings.service.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { Role } from '../../../generated/prisma/client.js';
import { TenantId } from '../../common/decorators/tenant-id.decorator.js';
import { UpdateRazorpayDto } from '../dto/update-razorpay.dto.js';
import { UpdateWhatsappDto } from '../dto/update-whatsapp.dto.js';
import { UpdateNotificationPrefsDto } from '../dto/update-notification-prefs.dto.js';

@Controller('settings/integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IntegrationSettingsController {
  constructor(
    private readonly integrationSettingsService: IntegrationSettingsService
  ) {}

  @Get()
  @Roles(Role.OWNER)
  async getSettings(@TenantId() tenantId: string) {
    return this.integrationSettingsService.getSettings(tenantId);
  }

  // PATCH /settings/integrations/razorpay
  @Patch('razorpay')
  @Roles(Role.OWNER)
  async updateRazorpay(
    @TenantId() tenantId: string,
    @Body() dto: UpdateRazorpayDto
  ) {
    return this.integrationSettingsService.updateRazorpaySettings(
      tenantId, dto
    );
  }

  // PATCH /settings/integrations/whatsapp
  @Patch('whatsapp')
  @Roles(Role.OWNER)
  async updateWhatsapp(
    @TenantId() tenantId: string,
    @Body() dto: UpdateWhatsappDto
  ) {
    return this.integrationSettingsService.updateWhatsappSettings(
      tenantId, dto
    );
  }

  // PATCH /settings/integrations/notifications
  @Patch('notifications')
  @Roles(Role.OWNER)
  async updateNotifications(
    @TenantId() tenantId: string,
    @Body() dto: UpdateNotificationPrefsDto
  ) {
    return this.integrationSettingsService.updateNotificationPrefs(
      tenantId, dto
    );
  }
}
