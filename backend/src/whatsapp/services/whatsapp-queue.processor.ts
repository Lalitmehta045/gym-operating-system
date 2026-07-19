import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service.js';
import { WHATSAPP_PROVIDER_TOKEN } from '../providers/whatsapp-provider.interface.js';
import type { IWhatsAppProvider } from '../providers/whatsapp-provider.interface.js';

@Injectable()
export class WhatsappQueueProcessor {
  private readonly logger = new Logger(WhatsappQueueProcessor.name);
  private isProcessing = false;

  constructor(
    private prisma: PrismaService,
    @Inject(WHATSAPP_PROVIDER_TOKEN)
    private readonly whatsappProvider: IWhatsAppProvider,
  ) {}

  // Run every 10 seconds to process the queue
  @Cron('*/10 * * * * *')
  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const batchSize = 20;
      const now = new Date();

      // Find pending jobs: QUEUED or FAILED but eligible for retry
      const jobs = await this.prisma.whatsAppLog.findMany({
        where: {
          OR: [
            { status: 'QUEUED' },
            { 
              status: 'FAILED', 
              retryCount: { lt: 5 },
              nextRetryAt: { lte: now }
            }
          ]
        },
        orderBy: { createdAt: 'asc' },
        take: batchSize,
        include: {
          member: true,
          tenant: true
        }
      });

      if (jobs.length === 0) {
        this.isProcessing = false;
        return;
      }

      this.logger.log(`Processing ${jobs.length} WhatsApp notification jobs...`);

      for (const job of jobs) {
        const payload = job.payload as any;
        if (!payload || !payload.to) {
          await this.markAsFailed(job.id, 'Invalid payload: missing phone number', job.retryCount, false);
          continue;
        }

        try {
          // Send via the active provider (Meta or Mock)
          const result = await this.whatsappProvider.sendTemplate(
            payload.to,
            job.templateName || job.type.toLowerCase(),
            payload.languageCode || 'en_US',
            payload.components || []
          );

          // Update status to SENT and record the messageId
          await this.prisma.whatsAppLog.update({
            where: { id: job.id },
            data: {
              status: 'SENT',
              messageId: result.messageId,
              metadata: { ...((job.metadata as any) || {}), lastAttemptAt: new Date().toISOString() }
            }
          });
          
        } catch (error: any) {
          const isTransient = error.name === 'ServiceUnavailableException' || 
                              error.name === 'GatewayTimeoutException' ||
                              error.name === 'BadGatewayException' ||
                              error.name === 'InternalServerErrorException';
                              
          await this.markAsFailed(
            job.id, 
            error.message || 'Unknown error', 
            job.retryCount, 
            isTransient
          );
        }
      }

    } catch (error) {
      this.logger.error('Error processing WhatsApp queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async markAsFailed(jobId: string, errorMessage: string, currentRetryCount: number, isTransient: boolean) {
    const nextRetryCount = currentRetryCount + 1;
    const maxRetries = 5;
    
    // Exponential backoff: 10s, 30s, 90s, 270s, 810s
    let nextRetryAt: Date | null = null;
    if (isTransient && nextRetryCount < maxRetries) {
      nextRetryAt = new Date(Date.now() + Math.pow(3, nextRetryCount) * 10000);
    }

    const finalStatus = (!isTransient || nextRetryCount >= maxRetries) ? 'FAILED_PERMANENTLY' : 'FAILED';

    await this.prisma.whatsAppLog.update({
      where: { id: jobId },
      data: {
        status: finalStatus,
        retryCount: nextRetryCount,
        nextRetryAt,
        metadata: {
          error: errorMessage,
          lastAttemptAt: new Date().toISOString(),
          isTransient
        }
      }
    });

    if (finalStatus === 'FAILED_PERMANENTLY') {
      this.logger.error(`Job ${jobId} failed permanently after ${nextRetryCount} attempts. Error: ${errorMessage}`);
    } else {
      this.logger.warn(`Job ${jobId} transient failure (attempt ${nextRetryCount}). Retrying at ${nextRetryAt}`);
    }
  }
}
