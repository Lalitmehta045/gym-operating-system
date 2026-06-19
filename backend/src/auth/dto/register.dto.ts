// ============================================================================
// RegisterOwnerDto — Gym registration + Owner account creation
// ============================================================================

import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  PHONE_PATTERN,
  PHONE_VALIDATION_MESSAGE,
} from '../../common/validators/validation.constants.js';

export class RegisterOwnerDto {
  // ── Gym (Tenant) Fields ──

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  gymName: string;

  @IsEmail()
  @IsNotEmpty()
  gymEmail: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(PHONE_PATTERN, { message: PHONE_VALIDATION_MESSAGE })
  gymPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  gymAddress?: string;

  // ── Owner (User) Fields ──

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#\-_+=|<>{}[\]\\])/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;
}
