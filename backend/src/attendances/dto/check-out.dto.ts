import { IsNotEmpty, IsUUID } from 'class-validator';

export class CheckOutDto {
  @IsNotEmpty()
  @IsUUID('4')
  attendanceId: string;
}
