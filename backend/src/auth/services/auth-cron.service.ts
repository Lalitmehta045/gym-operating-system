import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AuthCronService {
  private readonly logger = new Logger(AuthCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupRefreshTokens() {
    this.logger.log(
      'Starting daily cleanup of expired and revoked refresh tokens...',
    );
    try {
      const result = await this.prisma.refreshToken.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { not: null } }],
        },
      });
      this.logger.log(
        `Cleanup complete. Deleted ${result.count} refresh tokens.`,
      );
    } catch (error) {
      this.logger.error('Failed to cleanup refresh tokens', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOldTokenFamilies() {
    this.logger.log('Starting cleanup of orphaned token families...');
    try {
      const result = await this.prisma.refreshToken.deleteMany({
        where: {
          AND: [
            { revokedAt: { not: null } },
            { expiresAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
          ],
        },
      });
      this.logger.log(
        `Token family cleanup complete. Deleted ${result.count} old tokens.`,
      );
    } catch (error) {
      this.logger.error('Failed to cleanup token families', error);
    }
  }
}
