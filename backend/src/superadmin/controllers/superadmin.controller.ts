import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { SuperadminService } from '../services/superadmin.service.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { Role } from '../../../generated/prisma/client.js';
import { SkipSubscriptionCheck } from '../../common/decorators/skip-subscription.decorator.js';

@Controller('superadmin')
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN)
@SkipSubscriptionCheck()
export class SuperadminController {
  constructor(private readonly superadminService: SuperadminService) {}

  @Get('tenants/pending')
  getPendingTenants() {
    return this.superadminService.getPendingTenants();
  }

  @Patch('tenants/:id/approve')
  approveTenant(@Param('id') id: string) {
    return this.superadminService.approveTenant(id);
  }

  @Patch('tenants/:id/reject')
  rejectTenant(@Param('id') id: string) {
    return this.superadminService.rejectTenant(id);
  }
}
