// ============================================================================
// AuthController — Authentication API endpoints
// Refactored location: auth/controllers/auth.controller.ts
// ============================================================================

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { AuthService } from '../services/auth.service.js';
import { RegisterOwnerDto } from '../dto/register.dto.js';
import { LoginDto } from '../dto/login.dto.js';
import { ForgotPasswordDto } from '../dto/forgot-password.dto.js';
import { ResetPasswordDto } from '../dto/reset-password.dto.js';
import { ChangePasswordDto } from '../dto/change-password.dto.js';
import { UpdateProfileDto } from '../dto/update-profile.dto.js';
import { AuthResponseDto, AuthUserDto } from '../dto/auth-response.dto.js';
import { Public } from '../decorators/public.decorator.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { SkipSubscriptionCheck } from '../../common/decorators/skip-subscription.decorator.js';
import { AuditEntity, AuditAction } from '../../../generated/prisma/client.js';
import { AuditLog } from '../../audit/decorators/audit-log.decorator.js';
import * as crypto from 'crypto';

@Controller('auth')
@SkipThrottle({ default: true })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── GET /api/v1/auth/csrf-token ─────────────────────────────────────────

  /**
   * Generate a CSRF token for state-changing requests.
   * Sets token in both cookie and returns in response body.
   */
  @Public()
  @Get('csrf-token')
  @SkipSubscriptionCheck()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  getCsrfToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): { csrfToken: string } {
    const csrfToken = crypto.randomBytes(32).toString('hex');

    const isProduction = process.env.NODE_ENV === 'production';

    response.cookie('csrfToken', csrfToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { csrfToken };
  }

  // ── POST /api/v1/auth/register ──────────────────────────────────────────

  /**
   * Register a new gym (Tenant) and its Owner account.
   * Returns access token, refresh token (as HttpOnly cookie), and user profile.
   */
  @Public()
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async register(
    @Body() dto: RegisterOwnerDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    const userAgent = request.headers['user-agent'];
    const ipAddress = request.ip;
    return this.authService.registerOwner(dto, response, userAgent, ipAddress);
  }

  // ── POST /api/v1/auth/login ─────────────────────────────────────────────

  /**
   * Authenticate with email and password.
   * Enforces account-lock protection after 5 consecutive failed attempts.
   * Returns access token, refresh token (as HttpOnly cookie), and user profile.
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @AuditLog(AuditEntity.USER, AuditAction.LOGIN, '🔓 User Logged In')
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const userAgent = request.headers['user-agent'];
    const ipAddress = request.ip;
    return this.authService.login(dto, response, userAgent, ipAddress);
  }

  // ── POST /api/v1/auth/refresh ───────────────────────────────────────────

  /**
   * Rotate refresh token — revoke the old token and issue a new pair.
   * Refresh token is read from HttpOnly cookie.
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(request, response);
  }

  // ── POST /api/v1/auth/logout ────────────────────────────────────────────

  /**
   * Revoke all active refresh tokens for the authenticated user.
   * Requires a valid JWT access token.
   */
  @Post('logout')
  @SkipSubscriptionCheck()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @AuditLog(AuditEntity.USER, AuditAction.LOGOUT, '🔒 User Logged Out')
  async logout(
    @CurrentUser('sub') userId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    return this.authService.logout(userId, response);
  }

  // ── POST /api/v1/auth/logout-all ────────────────────────────────────────

  /**
   * Alias for logout — revokes all active refresh tokens for the user.
   */
  @Post('logout-all')
  @SkipSubscriptionCheck()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @AuditLog(AuditEntity.USER, AuditAction.LOGOUT, '🔒 User Logged Out (All Devices)')
  async logoutAll(
    @CurrentUser('sub') userId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    return this.authService.logout(userId, response);
  }

  // ── GET /api/v1/auth/me ─────────────────────────────────────────────────

  /**
   * Return the authenticated user's profile.
   * Requires a valid JWT access token.
   */
  @Get('me')
  @SkipSubscriptionCheck()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getMe(@CurrentUser('sub') userId: string): Promise<AuthUserDto> {
    return this.authService.getMe(userId);
  }

  // ── PATCH /api/v1/auth/me ───────────────────────────────────────────────

  /**
   * Update the authenticated user's profile (name fields only).
   */
  @Patch('me')
  @SkipSubscriptionCheck()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async updateMe(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<AuthUserDto> {
    return this.authService.updateMe(userId, dto);
  }

  // ── POST /api/v1/auth/forgot-password ──────────────────────────────────

  /**
   * Initiate password reset flow.
   * Generates a secure, hashed reset token (15-min TTL). The raw token must be
   * delivered via email — it is never returned in the HTTP response.
   *
   * Always returns 200 OK (no user-enumeration leakage).
   */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto);
  }

  // ── POST /api/v1/auth/reset-password ───────────────────────────────────

  /**
   * Complete the password reset.
   * Validates the raw token against its stored hash, updates the password,
   * and invalidates the token so it can never be reused.
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(dto);
  }

  // ── PATCH /api/v1/auth/change-password ─────────────────────────────────

  /**
   * Change password for the authenticated user.
   * Requires the current password and invalidates all active sessions.
   */
  @Patch('change-password')
  @SkipSubscriptionCheck()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.changePassword(userId, dto);
  }
}
