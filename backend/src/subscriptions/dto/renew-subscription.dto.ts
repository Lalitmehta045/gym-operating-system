import { PaymentMethod } from '../../../generated/prisma/client.js';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class RenewSubscriptionDto {
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  notes?: string;
}
