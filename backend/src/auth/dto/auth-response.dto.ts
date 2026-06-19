// ============================================================================
// AuthResponseDto — Unified auth response shape
// ============================================================================

import { Role } from '../../../generated/prisma/client.js';

export class AuthUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  tenantId: string | null;
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: AuthUserDto;
}
