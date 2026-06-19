import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CheckInDto {
  @IsNotEmpty()
  @IsUUID('4')
  memberId: string;
}
