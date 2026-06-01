import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, tap } from 'rxjs';

/**
 * Emite eventos `audit.*` para mutaciones (POST/PUT/PATCH/DELETE).
 * El AuditService los escucha y persiste en audit_logs sin acoplar dominio.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly events: EventEmitter2) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest();
    const method: string = req.method;
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    return next.handle().pipe(
      tap((response) => {
        if (!isMutation) return;
        this.events.emit('audit.action', {
          userId: req.user?.id ?? null,
          action: `${req.route?.path ?? req.url}:${method}`,
          entity: ctx.getClass().name,
          entityId: response?.id ?? response?.data?.id ?? null,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        });
      }),
    );
  }
}
