import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ListPaymentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Type(() => String)
  search?: string;

  @IsOptional()
  @Type(() => String)
  status?: string;

  @IsOptional()
  @Type(() => String)
  method?: string;

  @IsOptional()
  @Type(() => String)
  startDate?: string;

  @IsOptional()
  @Type(() => String)
  endDate?: string;
}
