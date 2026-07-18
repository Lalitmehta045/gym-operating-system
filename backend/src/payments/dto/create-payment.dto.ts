import {
  PaymentMethod,
  PaymentStatus,
} from '../../../generated/prisma/client.js';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsUUID('4')
  @IsNotEmpty()
  memberId: string;

  @IsUUID('4')
  @IsOptional()
  subscriptionId?: string;

  @IsUUID('4')
  @IsNotEmpty()
  invoiceId: string;

  @IsNumber()
  @IsPositive({ message: 'Payment amount must be a positive number' })
  @Min(1, { message: 'Payment amount must be at least ₹1' })
  @Max(99999999.99)
  @IsNotEmpty()
  amount: number;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  transactionReference?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  notes?: string;
}
