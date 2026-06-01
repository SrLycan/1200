import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(params: {
    userId?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    changes?: unknown;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: params.userId ?? undefined,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? undefined,
        changes: params.changes as never,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  }
}
