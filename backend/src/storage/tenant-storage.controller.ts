import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { TenantStorageService } from './tenant-storage.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('storage')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantStorageController {
  constructor(private readonly storageService: TenantStorageService) {}

  @Get('current')
  @Roles('OWNER', 'MANAGER', 'SUPER_ADMIN')
  async getCurrentStorage(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.storageService.calculateTenantStorage(tenantId);
  }

  @Get('usage')
  @Roles('OWNER', 'MANAGER')
  async getStorageUsage(@Req() req: any) {
    // Return dummy historical data for line chart
    const current = await this.getCurrentStorage(req);
    
    // Simulate growth graph data
    const history: { month: string; usedMB: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      history.push({
        month: d.toLocaleString('default', { month: 'short' }),
        usedMB: Math.max(0, (current.usedStorageBytes / (1024 * 1024)) - (i * 50)), // Fake progression
      });
    }

    return {
      history,
      current: current.usedStorageBytes,
      limit: current.storageLimitBytes
    };
  }
}
