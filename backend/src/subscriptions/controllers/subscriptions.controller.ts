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
import { Role } from '../../../generated/prisma/client.js';
import { HttpCacheInterceptor } from '../../common/interceptors/http-cache.interceptor.js';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';

@Controller('subscriptions')
@Roles(Role.OWNER, Role.MANAGER)
@UseInterceptors(HttpCacheInterceptor)
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
  @CacheTTL(600) // 10 minutes
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
  @CacheTTL(600) // 10 minutes
  findExpiring(
    @CurrentUser() user: JwtPayload,
    @Query() query: ExpiringSubscriptionsQueryDto,
  ) {
    return this.subscriptionsService.getExpiringSubscriptions(
      this.getTenantId(user),
      query.days,
    );
  }

  @Get(':id')
  @CacheTTL(600) // 10 minutes
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
