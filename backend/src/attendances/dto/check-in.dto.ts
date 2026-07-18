import { IsNotEmpty, IsString, IsUUID, IsOptional, IsDateString } from 'class-validator';

export class CheckInDto {
  @IsNotEmpty()
  @IsUUID('4')
  memberId: string;

  @IsOptional()
  @IsDateString()
  checkInTime?: string;

  @IsOptional()
  @IsDateString()
  checkOutTime?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
