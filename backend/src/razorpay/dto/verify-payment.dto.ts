import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class VerifyPaymentDto {
  @IsUUID('4')
  @IsNotEmpty()
  subscriptionId: string;

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
