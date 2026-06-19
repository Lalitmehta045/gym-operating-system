// ============================================================================
// ForgotPasswordDto — Email address to trigger password reset
// ============================================================================

import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  /**
   * The email address associated with the account.
   * A password-reset link/token will be sent to this address.
   */
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;
}
