import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { StaffService } from '../services/staff.service.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';
import { Role } from '../../../generated/prisma/client.js';
import { CreateStaffDto } from '../dto/create-staff.dto.js';
import { UpdateStaffRoleDto } from '../dto/update-staff-role.dto.js';

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @Roles(Role.OWNER)
  async getAllStaff(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!user.tenantId) throw new NotFoundException('Tenant context required');
    return this.staffService.getAllStaff(
      user.tenantId,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Post()
  async createStaff(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateStaffDto,
  ) {
    if (!user.tenantId) throw new NotFoundException('Tenant context required');
    return this.staffService.createStaff(user.tenantId, dto);
  }

  @Patch(':id/role')
  async updateStaffRole(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateStaffRoleDto,
  ) {
    if (!user.tenantId) throw new NotFoundException('Tenant context required');
    return this.staffService.updateStaffRole(user.tenantId, id, dto);
  }

  @Patch(':id/deactivate')
  async deactivateStaff(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    if (!user.tenantId) throw new NotFoundException('Tenant context required');
    return this.staffService.deactivateStaff(user.tenantId, id, user.sub);
  }

  @Patch(':id/reactivate')
  async reactivateStaff(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    if (!user.tenantId) throw new NotFoundException('Tenant context required');
    return this.staffService.reactivateStaff(user.tenantId, id);
  }
}
