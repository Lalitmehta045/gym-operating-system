import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class ExpiringSubscriptionsQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  days: number = 7;
}
