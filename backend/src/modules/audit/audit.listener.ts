import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditService } from './audit.service';

@Injectable()
export class AuditListener {
  constructor(private readonly audit: AuditService) {}

  @OnEvent('audit.action')
  async onAction(payload: {
    userId?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await this.audit.log(payload);
  }
}
