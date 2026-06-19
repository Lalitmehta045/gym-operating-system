// ============================================================================
// JwtPayload — Shape of the decoded JWT access token
// ============================================================================

import { Role } from '../../../generated/prisma/client.js';

export interface JwtPayload {
  /** User ID (maps to `user.id`) */
  sub: string;

  /** User email */
  email: string;

  /** RBAC role */
  role: Role;

  /** Tenant ID — null for SUPER_ADMIN platform-level users */
  tenantId: string | null;
}
