// ============================================================================
// @Roles() — RBAC metadata decorator
// ============================================================================

import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../generated/prisma/client.js';

export const ROLES_KEY = 'roles';

/**
 * Decorator to restrict a route handler to specific roles.
 *
 * @example
 * ```ts
 * @Roles(Role.OWNER, Role.SUPER_ADMIN)
 * @Get('dashboard')
 * getDashboard() { ... }
 * ```
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
