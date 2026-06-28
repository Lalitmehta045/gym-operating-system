import { SetMetadata } from '@nestjs/common';
import { AuditEntity, AuditAction } from '../../../generated/prisma/client.js';

export const AUDIT_LOGS_KEY = 'audit_logs_metadata';

export interface AuditLogMetadata {
  entity: AuditEntity;
  action: AuditAction;
  descriptionPattern: string; // e.g. 'Member {firstName} {lastName} created' or 'User logged in'
}

export const AuditLogs = (...logs: AuditLogMetadata[]) => SetMetadata(AUDIT_LOGS_KEY, logs);

export const AuditLog = (entity: AuditEntity, action: AuditAction, descriptionPattern: string) =>
  SetMetadata(AUDIT_LOGS_KEY, [{ entity, action, descriptionPattern }]);
