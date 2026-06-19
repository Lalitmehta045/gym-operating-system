// ============================================================================
// RefreshTokenDto — Token rotation request payload
// ============================================================================

import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
