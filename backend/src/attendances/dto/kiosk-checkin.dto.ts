import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class KioskCheckInDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  memberCode: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'phoneLast4 must be exactly 4 digits' })
  phoneLast4: string;

  @IsNotEmpty()
  @IsUUID('4')
  gymId: string;
}
