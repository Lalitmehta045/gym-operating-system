import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class QrScanDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(2048)
  qrToken: string;
}
