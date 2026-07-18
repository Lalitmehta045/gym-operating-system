import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  ForbiddenException,
  Query,
  UseInterceptors,
} from '@nestjs/common';

import { InvoicesService } from '../services/invoices.service.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Role } from '../../../generated/prisma/client.js';

import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';
import { ListInvoicesQueryDto } from '../dto/list-invoices-query.dto.js';

@Controller('invoices')
@Roles(Role.OWNER, Role.MANAGER)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  private getTenantId(user: JwtPayload): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant-scoped access is required');
    }
    return user.tenantId;
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListInvoicesQueryDto,
  ) {
    return this.invoicesService.getAllInvoices(this.getTenantId(user), query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.invoicesService.getInvoiceById(this.getTenantId(user), id);
  }
}
