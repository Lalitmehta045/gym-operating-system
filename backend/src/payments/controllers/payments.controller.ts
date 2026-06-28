import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  ForbiddenException,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { PaymentsService } from '../services/payments.service.js';
import { CreatePaymentDto } from '../dto/create-payment.dto.js';
import { ListPaymentsQueryDto } from '../dto/list-payments-query.dto.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Role, AuditEntity, AuditAction } from '../../../generated/prisma/client.js';
import { AuditLog } from '../../audit/decorators/audit-log.decorator.js';
import { HttpCacheInterceptor } from '../../common/interceptors/http-cache.interceptor.js';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';

@Controller('payments')
@Roles(Role.OWNER, Role.MANAGER)
@UseInterceptors(HttpCacheInterceptor)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  private getTenantId(user: JwtPayload): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant-scoped access is required');
    }
    return user.tenantId;
  }

  @Post()
  @AuditLog(AuditEntity.PAYMENT, AuditAction.CREATE, '💳 Payment Created')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(this.getTenantId(user), dto);
  }

  @Get()
  @CacheTTL(900) // 15 minutes
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListPaymentsQueryDto,
  ) {
    return this.paymentsService.getAllPayments(this.getTenantId(user), query);
  }

  @Get(':id')
  @CacheTTL(900) // 15 minutes
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.paymentsService.getPaymentById(this.getTenantId(user), id);
  }
}
