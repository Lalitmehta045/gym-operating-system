import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { ExpiryNotificationService } from './services/expiry-notification.service.js';
import { NotificationQueryDto } from './dto/notification-query.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/client.js';
import { TenantId } from '../common/decorators/tenant-id.decorator.js';
import {
  CacheControl,
  CACHE_PRESETS,
} from '../common/decorators/cache-control.decorator.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER, Role.MANAGER)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly expiryNotificationService: ExpiryNotificationService,
  ) {}

  @Post('trigger-expiry-check')
  @Roles(Role.OWNER)
  async triggerExpiryCheck(@TenantId() tenantId: string) {
    // Manual trigger for testing
    await this.expiryNotificationService.processExpiringSubscriptions();
    return { message: 'Expiry check triggered successfully' };
  }

  @Get()
  async listNotifications(
    @TenantId() tenantId: string,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationsService.listNotifications(tenantId, query);
  }

  @Get('unread-count')
  @CacheControl(CACHE_PRESETS.REALTIME)
  async getUnreadCount(@TenantId() tenantId: string) {
    return this.notificationsService.getUnreadCount(tenantId);
  }

  @Patch('read-all')
  async markAllAsRead(@TenantId() tenantId: string) {
    return this.notificationsService.markAllAsRead(tenantId);
  }

  @Get(':id')
  async getNotification(
    @TenantId() tenantId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.notificationsService.getNotificationById(tenantId, id);
  }

  @Patch(':id/read')
  async markAsRead(
    @TenantId() tenantId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.notificationsService.markAsRead(tenantId, id);
  }
}
