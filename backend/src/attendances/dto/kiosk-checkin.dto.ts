import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';


export class KioskCheckInDto {
  @IsUUID('4')
  @IsNotEmpty()
  memberId: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'phoneLast4 must be exactly 4 digits' })
  phoneLast4: string;

  @IsNotEmpty()
  @IsUUID('4')
  gymId: string;
}
