// ============================================================================
// AuthService — Core authentication business logic
// Refactored location: auth/services/auth.service.ts
// ============================================================================

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Role } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TenantSubscriptionService } from '../../tenant-subscription/services/tenant-subscription.service.js';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';
import { RegisterOwnerDto } from '../dto/register.dto.js';
import { LoginDto } from '../dto/login.dto.js';
import { ForgotPasswordDto } from '../dto/forgot-password.dto.js';
import { ResetPasswordDto } from '../dto/reset-password.dto.js';
import { ChangePasswordDto } from '../dto/change-password.dto.js';
import { UpdateProfileDto } from '../dto/update-profile.dto.js';
import { AuthResponseDto, AuthUserDto } from '../dto/auth-response.dto.js';

// ─── Constants ───────────────────────────────────────────────────────────────

/** bcrypt salt rounds for password hashing */
const SALT_ROUNDS = 12;

/** Access token TTL */
const ACCESS_TOKEN_EXPIRY = '15m';

/** Refresh token TTL in days */
const REFRESH_TOKEN_DAYS = 7;

/** Max consecutive failed login attempts before account lock */
const MAX_FAILED_ATTEMPTS = 5;

/** Account lock duration in minutes */
const LOCK_DURATION_MINUTES = 15;

/** Password-reset token TTL in minutes */
const RESET_TOKEN_EXPIRY_MINUTES = 15;

/** Cookie name for refresh token */
export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

/** Refresh token cookie max age in milliseconds */
const REFRESH_TOKEN_COOKIE_MAX_AGE = REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly refreshSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tenantSubscriptionService: TenantSubscriptionService,
  ) {
    this.refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ?? '';
    if (!this.refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }
  }

  // ─── Register Owner ────────────────────────────────────────────────────────

  /**
   * Registers a new gym (Tenant) along with its Owner user.
   * Wraps tenant + user creation in a Prisma transaction for atomicity.
   */
  async registerOwner(
    dto: RegisterOwnerDto,
    response: Response,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ message: string }> {
    // Check for existing tenant with same email
    const [existingTenant, passwordHash] = await Promise.all([
      this.prisma.tenant.findUnique({
        where: { email: dto.gymEmail },
      }),
      bcrypt.hash(dto.password, SALT_ROUNDS),
    ]);

    if (existingTenant) {
      throw new ConflictException('A gym with this email already exists');
    }

    // Atomic transaction: create tenant + owner user
    const { tenant, user } = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.gymName,
          email: dto.gymEmail,
          phone: dto.gymPhone,
          address: dto.gymAddress,
          status: 'PENDING',
          isActive: false,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          passwordHash,
          role: Role.OWNER,
          isActive: false,
        },
      });

      return { tenant, user };
    });

    this.logger.log(`Gym "${tenant.name}" registered with owner ${user.email}`);

    return {
      message:
        'Registration successful. Your account is pending superadmin approval.',
    };
  }

  // ─── Login (with account-lock protection) ─────────────────────────────────

  /**
   * Authenticates a user by email/password.
   *
   * Security features:
   *  - Increments `failedLoginAttempts` on every wrong password
   *  - Locks the account for LOCK_DURATION_MINUTES after MAX_FAILED_ATTEMPTS
   *  - Resets the counter and clears the lock on successful login
   *  - Updates `lastLoginAt` on success
   */
  async login(
    dto: LoginDto,
    response: Response,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    // Find user by email (not soft-deleted)
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        deletedAt: null,
      },
      include: {
        tenant: true,
      },
    });

    // Always run the same generic error to prevent user-enumeration
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.tenant && user.tenant.status === 'PENDING') {
      throw new UnauthorizedException(
        'Your account is currently under review by the superadmin.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // ── Account-lock check ──────────────────────────────────────────────────
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMs = user.lockedUntil.getTime() - Date.now();
      const remainingMins = Math.ceil(remainingMs / 60_000);
      throw new ForbiddenException(
        `Account is temporarily locked. Try again in ${remainingMins} minute(s).`,
      );
    }

    // ── Password validation ─────────────────────────────────────────────────
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      await this.handleFailedLogin(user.id, user.failedLoginAttempts);
      throw new UnauthorizedException('Invalid credentials');
    }

    // ── Successful login — reset security counters ──────────────────────────
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    this.logger.log(`User ${user.email} logged in`);

    return this.buildAuthResponse(user, response, userAgent, ipAddress);
  }

  // ─── Refresh Tokens ────────────────────────────────────────────────────────

  /**
   * Validates the incoming refresh token from HttpOnly cookie, revokes it,
   * and issues a new access + refresh token pair (token rotation).
   *
   * Implements token family tracking to detect replay attacks:
   * If a revoked token is reused, all tokens in that family are invalidated.
   */
  async refreshTokens(
    request: Request,
    response: Response,
  ): Promise<AuthResponseDto> {
    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const matchedToken = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });

    if (!matchedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // ── Token Family Replay Attack Detection ─────────────────────────────────
    // If the token was already revoked, someone may have stolen it.
    // Invalidate ALL tokens in this family to force re-authentication.
    if (matchedToken.revokedAt) {
      this.logger.warn(
        `Replay attack detected: revoked token reused for user ${matchedToken.userId}`,
      );

      await this.prisma.refreshToken.updateMany({
        where: { familyId: matchedToken.familyId },
        data: { revokedAt: new Date() },
      });

      throw new UnauthorizedException(
        'Token reuse detected. Please log in again.',
      );
    }

    // Check if token is expired
    if (matchedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    if (!matchedToken.user.isActive || matchedToken.user.deletedAt) {
      throw new UnauthorizedException('User account is deactivated');
    }

    // Revoke the used token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { revokedAt: new Date() },
    });

    const userAgent = request.headers['user-agent'] || undefined;
    const ipAddress = request.ip;

    return this.buildAuthResponse(
      matchedToken.user,
      response,
      userAgent,
      ipAddress,
      matchedToken.familyId,
    );
  }

  // ─── Logout ────────────────────────────────────────────────────────────────

  /**
   * Revokes all active refresh tokens for the given user and clears the cookie.
   */
  async logout(
    userId: string,
    response: Response,
  ): Promise<{ message: string }> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    // Clear the refresh token cookie
    this.clearRefreshTokenCookie(response);

    this.logger.log(`User ${userId} logged out — all tokens revoked`);

    return { message: 'Logged out successfully' };
  }

  // ─── Get Current User ──────────────────────────────────────────────────────

  /**
   * Returns the current user's profile (without sensitive fields).
   */
  async getMe(userId: string): Promise<AuthUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenantId,
    };
  }

  /**
   * Updates the authenticated user's name fields.
   */
  async updateMe(userId: string, dto: UpdateProfileDto): Promise<AuthUserDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenantId,
    };
  }

  // ─── Forgot Password ───────────────────────────────────────────────────────

  /**
   * Initiates the password-reset flow.
   *
   * Steps:
   *  1. Look up user by email (non-deleted, active)
   *  2. Generate a 32-byte cryptographically random token
   *  3. Hash it with SHA-256 and store the hash + expiry in the DB
   *  4. Deliver the raw token to the user via email (never in the HTTP response)
   *
   * Security: always returns a 200 with the same message regardless of whether
   * the email exists, to prevent user enumeration.
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const genericResponse = {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };

    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        deletedAt: null,
        isActive: true,
      },
    });

    // Always return the same message to prevent email enumeration
    if (!user) {
      return genericResponse;
    }

    // Generate raw token (sent to user via email)
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Store only the SHA-256 hash — never store the plaintext token
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: tokenHash,
        passwordResetExpiresAt: expiresAt,
      },
    });

    this.logger.log(
      `Password reset token generated for ${user.email} (expires ${expiresAt.toISOString()})`,
    );

    // TODO: send `rawToken` via email service — never include it in the response.
    return genericResponse;
  }

  // ─── Change Password ─────────────────────────────────────────────────────

  /**
   * Changes the password for an authenticated user.
   * Verifies the current password, hashes the new one, and revokes all sessions.
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, passwordHash: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    this.logger.log(
      `Password changed for ${user.email} — all sessions invalidated`,
    );

    return { message: 'Password updated successfully. Please log in again.' };
  }

  // ─── Reset Password ────────────────────────────────────────────────────────

  /**
   * Completes the password-reset flow.
   *
   * Steps:
   *  1. Hash the incoming raw token with SHA-256
   *  2. Find the user whose stored hash matches, and token is not expired
   *  3. Hash the new password with bcrypt
   *  4. Update the password and clear the reset token fields (single-use)
   *  5. Revoke all active refresh tokens (force re-login everywhere)
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    // Re-hash the incoming raw token for constant-time DB lookup
    const tokenHash = crypto
      .createHash('sha256')
      .update(dto.token)
      .digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpiresAt: { gt: new Date() },
        deletedAt: null,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid or expired password reset token',
      );
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    // Atomic: update password + clear reset token + revoke all refresh tokens
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
          passwordResetToken: null,
          passwordResetExpiresAt: null,
          // Also reset any account-lock state
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      // Force logout from all devices after password change
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    this.logger.log(
      `Password reset successful for ${user.email} — all sessions invalidated`,
    );

    return { message: 'Password has been reset successfully. Please log in.' };
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  /**
   * Handles a failed login attempt for the given user.
   * Increments the counter; locks the account if the threshold is reached.
   */
  private async handleFailedLogin(
    userId: string,
    currentAttempts: number,
  ): Promise<void> {
    const newAttempts = currentAttempts + 1;
    const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;

    const lockedUntil = shouldLock
      ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000)
      : undefined;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: newAttempts,
        ...(lockedUntil !== undefined && { lockedUntil }),
      },
    });

    if (shouldLock) {
      this.logger.warn(
        `Account ${userId} locked until ${lockedUntil!.toISOString()} after ${newAttempts} failed attempts`,
      );
    }
  }

  /**
   * Builds the unified auth response with access token, refresh token, and user profile.
   * Sets refresh token as HttpOnly cookie.
   */
  private async buildAuthResponse(
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: Role;
      tenantId: string | null;
    },
    response: Response,
    userAgent?: string,
    ipAddress?: string,
    existingFamilyId?: string,
  ): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(
        user.id,
        userAgent,
        ipAddress,
        existingFamilyId,
      ),
    ]);

    // Set refresh token as HttpOnly cookie
    this.setRefreshTokenCookie(response, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  /**
   * Signs a JWT access token with the configured secret and expiry.
   */
  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
  }

  /**
   * Generates a cryptographically random refresh token, stores its bcrypt hash
   * in the database, and returns the raw token to the client.
   * Uses token families for replay attack detection.
   */
  private async generateRefreshToken(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
    familyId?: string,
  ): Promise<string> {
    const rawToken = crypto.randomBytes(48).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    // Use existing family ID or generate new one
    const tokenFamilyId = familyId || crypto.randomUUID();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        familyId: tokenFamilyId,
        expiresAt,
        userAgent,
        ipAddress,
      },
    });

    return rawToken;
  }

  /**
   * Sets the refresh token as an HttpOnly, Secure, SameSite cookie.
   */
  private setRefreshTokenCookie(response: Response, token: string): void {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    response.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
      maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
      path: '/api/v1/auth',
    });
  }

  /**
   * Clears the refresh token cookie.
   */
  private clearRefreshTokenCookie(response: Response): void {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    response.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
      path: '/api/v1/auth',
    });
  }
}
