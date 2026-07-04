import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private readonly requestTimeoutMs: number;
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucketName = this.configService.get<string>('R2_BUCKET') || this.configService.get<string>('R2_BUCKET_NAME') || '';
    this.requestTimeoutMs = Number(
      this.configService.get<string>('R2_REQUEST_TIMEOUT_MS') || 10000,
    );
    if (!this.bucketName) {
      this.logger.error('Missing bucket configuration: R2_BUCKET is not set');
    }

    const endpoint = accountId
      ? `https://${accountId}.r2.cloudflarestorage.com`
      : this.configService.get<string>('S3_ENDPOINT');
    
    const region = this.configService.get<string>('S3_REGION') || 'auto';

    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId: accessKeyId || this.configService.get<string>('S3_ACCESS_KEY_ID') || '',
        secretAccessKey: secretAccessKey || this.configService.get<string>('S3_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async uploadFile(fileBuffer: Buffer, originalName: string, mimeType: string, folder: string): Promise<string> {
    if (!this.bucketName) {
      throw new Error('Storage configuration error: R2_BUCKET is missing.');
    }

    const ext = path.extname(originalName);
    const key = `${folder}/${randomUUID()}${ext}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      CacheControl: 'public, max-age=31536000, immutable',
    });

    try {
      const startedAt = performance.now();
      await this.s3Client.send(command, {
        abortSignal: AbortSignal.timeout(this.requestTimeoutMs),
      });
      const duration = Math.round(performance.now() - startedAt);
      if (duration >= this.requestTimeoutMs / 2) {
        this.logger.warn(`Slow storage upload key=${key} durationMs=${duration}`);
      }
      return key;
    } catch (error: any) {
      this.logger.error(`Failed to upload file to storage: ${error.message}`);
      throw new Error(`Storage upload failed: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.bucketName) {
      throw new Error('Storage configuration error: R2_BUCKET is missing.');
    }
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const startedAt = performance.now();
      await this.s3Client.send(command, {
        abortSignal: AbortSignal.timeout(this.requestTimeoutMs),
      });
      const duration = Math.round(performance.now() - startedAt);
      if (duration >= this.requestTimeoutMs / 2) {
        this.logger.warn(`Slow storage delete key=${key} durationMs=${duration}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to delete file from storage: ${error.message}`);
      throw new Error(`Storage delete failed: ${error.message}`);
    }
  }

  async downloadFile(key: string): Promise<Buffer> {
    if (!this.bucketName) {
      throw new Error('Storage configuration error: R2_BUCKET is missing.');
    }
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      const stream = response.Body as NodeJS.ReadableStream;
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    } catch (error: any) {
      this.logger.error(`Failed to download file from storage: ${error.message}`);
      throw new Error(`Storage download failed: ${error.message}`);
    }
  }

  getPublicUrl(key: string): string {
    const publicUrlBase = this.configService.get<string>('R2_PUBLIC_URL') || this.configService.get<string>('S3_PUBLIC_URL');
    if (!publicUrlBase) {
      return `https://${this.bucketName}.r2.cloudflarestorage.com/${key}`;
    }
    return `${publicUrlBase}/${key}`;
  }
}
