import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class VerifyTenantPaymentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  razorpay_order_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  razorpay_payment_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  razorpay_signature: string;
}
