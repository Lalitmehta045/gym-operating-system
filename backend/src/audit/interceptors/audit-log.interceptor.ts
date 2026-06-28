import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../audit.service.js';
import { AUDIT_LOGS_KEY, AuditLogMetadata } from '../decorators/audit-log.decorator.js';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metaArray = this.reflector.get<AuditLogMetadata[]>(
      AUDIT_LOGS_KEY,
      context.getHandler(),
    );

    if (!metaArray || metaArray.length === 0) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ipAddress = request.ip || request.headers['x-forwarded-for'];
    const userAgent = request.headers['user-agent'];

    return next.handle().pipe(
      tap(async (response) => {
        try {
          // If request.user is missing (e.g., login/register), try to get it from response
          const actualUser = user || (response && response.user) || response;
          if (!actualUser || !actualUser.id) return; // Cannot log without a user

          for (const meta of metaArray) {
            // Try to determine the entity ID. It could be in response.id, request.params.id, or actualUser.tenantId
            let entityId = 'system';
            if (response && response.id && meta.entity !== 'USER') {
              entityId = response.id;
            } else if (actualUser.id && meta.entity === 'USER') {
              entityId = actualUser.id;
            } else if (request.params && request.params.id) {
              entityId = request.params.id;
            } else if (actualUser.tenantId) {
              entityId = actualUser.tenantId;
            }

            // Generate description
            let description = meta.descriptionPattern;
            if (response) {
              // Very simple replacement from response object
              for (const key of Object.keys(response)) {
                description = description.replace(`{${key}}`, response[key]);
              }
            }
            if (request.body) {
              for (const key of Object.keys(request.body)) {
                description = description.replace(`{${key}}`, request.body[key]);
              }
            }

            // Clean up leftover placeholders
            description = description.replace(/{[^}]+}/g, '');

            // Check if there's a memberId involved
            let memberId: string | undefined = undefined;
            if (response && response.memberId) {
              memberId = response.memberId;
            } else if (request.body && request.body.memberId) {
              memberId = request.body.memberId;
            } else if (meta.entity === 'MEMBER') {
              memberId = entityId; // The member itself
            } else if (request.params && request.params.memberId) {
              memberId = request.params.memberId;
            }

            await this.auditService.createLog({
              tenantId: actualUser.tenantId || response?.tenantId || 'platform',
              userId: actualUser.id,
              memberId,
              entity: meta.entity,
              entityId,
              action: meta.action,
              description,
              ipAddress,
              userAgent,
              metadata: {
                  endpoint: request.url,
                  method: request.method
              }
            });
          }
        } catch (error) {
          this.logger.error(`Failed to execute audit logging: ${error.message}`, error.stack);
        }
      }),
    );
  }
}
