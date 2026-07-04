import { MediaCategory } from '../../generated/prisma/client.js';

export interface ProcessImageJobData {
  mediaId: string;
  tenantId: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  folder: string;
}
