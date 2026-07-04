import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateRazorpayDto {
  @IsOptional() @IsString() razorpayKeyId?: string;
  @IsOptional() @IsString() razorpayKeySecret?: string;
  @IsOptional() @IsString() razorpayWebhookSecret?: string;
  @IsOptional() @IsBoolean() razorpayEnabled?: boolean;
}
