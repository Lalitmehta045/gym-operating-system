import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  PHONE_PATTERN,
  PHONE_VALIDATION_MESSAGE,
} from '../../common/validators/validation.constants.js';

export class SendWhatsappMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(PHONE_PATTERN, { message: PHONE_VALIDATION_MESSAGE })
  to: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  text: string;
}

export class SendWhatsappTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(PHONE_PATTERN, { message: PHONE_VALIDATION_MESSAGE })
  to: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  templateName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  languageCode: string;

  @IsOptional()
  components?: unknown[];
}
