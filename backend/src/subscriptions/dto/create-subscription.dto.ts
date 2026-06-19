import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { SubscriptionStatus } from '../../../generated/prisma/client.js';

export class CreateSubscriptionDto {
  @IsUUID('4')
  @IsNotEmpty()
  memberId: string;

  @IsUUID('4')
  @IsNotEmpty()
  membershipPlanId: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsNumber()
  @Min(0)
  @Max(99999999.99)
  @IsNotEmpty()
  amount: number;

  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  notes?: string;
}
