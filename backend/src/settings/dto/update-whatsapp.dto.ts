import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateWhatsappDto {
  @IsOptional() @IsString() whatsappPhoneNumberId?: string;
  @IsOptional() @IsString() whatsappAccessToken?: string;
  @IsOptional() @IsString() whatsappBusinessId?: string;
  @IsOptional() @IsBoolean() whatsappEnabled?: boolean;
}
