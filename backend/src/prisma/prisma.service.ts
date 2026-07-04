// ============================================================================
// PrismaService — Managed PrismaClient lifecycle for NestJS
// ============================================================================

import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly slowQueryThresholdMs: number;

  constructor() {
    const enableQueryPerformanceLogs =
      process.env.PERFORMANCE_DB_QUERY_LOGGING === 'true';

    super({
      log: enableQueryPerformanceLogs
        ? [
            { level: 'query', emit: 'event' },
            { level: 'warn', emit: 'stdout' },
            { level: 'error', emit: 'stdout' },
          ]
        : process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });

    this.slowQueryThresholdMs = Number(
      process.env.PERFORMANCE_SLOW_DB_QUERY_MS ?? 250,
    );

    if (enableQueryPerformanceLogs) {
      this.$on('query' as never, (event: any) => {
        if (event.duration >= this.slowQueryThresholdMs) {
          this.logger.warn(
            `SLOW_DB_QUERY durationMs=${event.duration} query=${event.query}`,
          );
        }
      });
    }
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to the database.');
    } catch (error) {
      this.logger.error('Failed to connect to the database:', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Disconnected from the database.');
  }
}
