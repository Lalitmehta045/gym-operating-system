// ============================================================================
// ResetPasswordDto — Token + new password for the reset flow
// ============================================================================

import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  /**
   * The opaque reset token delivered to the user's email.
   * This is the *raw* (unhashed) token; the service will hash and compare.
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  token: string;

  /**
   * New password — must be ≥ 8 characters and contain at least one uppercase
   * letter, one lowercase letter, one digit, and one special character.
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#\-_+=|<>{}[\]\\])/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  newPassword: string;
}
