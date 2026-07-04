import { IsInt, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateNotificationPrefsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  notifyExpiringDays?: number;

  @IsOptional()
  @IsBoolean()
  notifyOnPayment?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnExpiry?: boolean;
}
