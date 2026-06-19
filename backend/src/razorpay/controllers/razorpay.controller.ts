import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { RazorpayService } from '../services/razorpay.service.js';
import { CreateOrderDto } from '../dto/create-order.dto.js';
import { VerifyPaymentDto } from '../dto/verify-payment.dto.js';
import { Public } from '../../auth/decorators/public.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { Role } from '../../../generated/prisma/client.js';

@Controller('api/v1/razorpay')
@Roles(Role.OWNER, Role.MANAGER)
export class RazorpayController {
  constructor(private readonly razorpayService: RazorpayService) {}

  @Post('create-order')
  async createOrder(@Req() req: any, @Body() dto: CreateOrderDto) {
    // Assuming tenantId is attached to the request via a global Auth/Tenant guard
    const tenantId = req.tenantId || req.user?.tenantId;
    return this.razorpayService.createOrder(tenantId, dto);
  }

  @Post('verify')
  async verifyPayment(@Req() req: any, @Body() dto: VerifyPaymentDto) {
    const tenantId = req.tenantId || req.user?.tenantId;
    return this.razorpayService.verifyPayment(tenantId, dto);
  }

  @Public()
  @SkipThrottle()
  @Post('webhook')
  async handleWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Req() req: any,
  ) {
    return this.razorpayService.handleWebhook(signature, req.rawBody, req.body);
  }

  @Public()
  @SkipThrottle()
  @Post('tenant/webhook')
  async handleTenantWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Req() req: any,
  ) {
    return this.razorpayService.handleTenantWebhook(signature, req.rawBody, req.body);
  }
}
