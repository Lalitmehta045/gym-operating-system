import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { SubscriptionsService } from '../services/subscriptions.service.js';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto.js';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto.js';
import { RenewSubscriptionDto } from '../dto/renew-subscription.dto.js';
import { ListSubscriptionsQueryDto } from '../dto/list-subscriptions-query.dto.js';
import { ExpiringSubscriptionsQueryDto } from '../dto/expiring-subscriptions-query.dto.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Role, AuditEntity, AuditAction } from '../../../generated/prisma/client.js';
import { AuditLogs } from '../../audit/decorators/audit-log.decorator.js';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';

@Controller('subscriptions')
@Roles(Role.OWNER, Role.MANAGER)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  private getTenantId(user: JwtPayload): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant-scoped access is required');
    }
    return user.tenantId;
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.createSubscription(
      this.getTenantId(user),
      dto,
    );
  }

  @Get()
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListSubscriptionsQueryDto,
  ) {
    return this.subscriptionsService.getAllSubscriptions(
      this.getTenantId(user),
      query,
    );
  }

  @Get('expiring')
  findExpiring(
    @CurrentUser() user: JwtPayload,
    @Query() query: ExpiringSubscriptionsQueryDto,
  ) {
    return this.subscriptionsService.getExpiringSubscriptions(
      this.getTenantId(user),
      query,
    );
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.subscriptionsService.getSubscriptionById(
      this.getTenantId(user),
      id,
    );
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.updateSubscription(
      this.getTenantId(user),
      id,
      dto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.OWNER)
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.subscriptionsService.deleteSubscription(
      this.getTenantId(user),
      id,
    );
  }

  @Post(':id/renew')
  @AuditLogs(
    { entity: AuditEntity.SUBSCRIPTION, action: AuditAction.SUBSCRIPTION_RENEWED, descriptionPattern: '🔄 Subscription Renewed' },
    { entity: AuditEntity.INVOICE, action: AuditAction.CREATE, descriptionPattern: '📄 Invoice Generated' }
  )
  renew(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: RenewSubscriptionDto,
  ) {
    return this.subscriptionsService.renewSubscription(
      this.getTenantId(user),
      id,
      dto,
    );
  }
}
