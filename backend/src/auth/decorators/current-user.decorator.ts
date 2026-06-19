// ============================================================================
// @CurrentUser() — Extract authenticated user from request
// ============================================================================

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';

/**
 * Parameter decorator to extract the authenticated user from the request.
 *
 * @example
 * ```ts
 * // Get entire payload
 * @Get('me')
 * getMe(@CurrentUser() user: JwtPayload) { ... }
 *
 * // Get a specific field
 * @Get('me')
 * getMe(@CurrentUser('sub') userId: string) { ... }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: JwtPayload = request.user;
    return data ? user?.[data] : user;
  },
);
