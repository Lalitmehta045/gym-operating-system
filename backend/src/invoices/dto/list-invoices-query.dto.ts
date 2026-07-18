import { IsInt, IsOptional, IsUUID, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ListInvoicesQueryDto {
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
  @IsUUID('4')
  memberId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
