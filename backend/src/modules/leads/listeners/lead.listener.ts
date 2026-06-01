import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Lead, NotificationType } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

/**
 * Workflows reactivos del módulo de leads.
 * Cada handler es pequeño y testeable; agrega más sin tocar el dominio.
 */
@Injectable()
export class LeadEventListener {
  private readonly logger = new Logger(LeadEventListener.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('lead.created')
  async onCreated(lead: Lead) {
    this.logger.log(`Lead created ${lead.id} (${lead.fullName})`);

    if (lead.ownerId) {
      await this.prisma.notification.create({
        data: {
          userId: lead.ownerId,
          type: NotificationType.LEAD_ASSIGNED,
          title: 'Nuevo lead asignado',
          body: `${lead.fullName} desde ${lead.source}`,
          link: `/leads/${lead.id}`,
        },
      });
    }

    await this.prisma.activity.create({
      data: {
        leadId: lead.id,
        userId: lead.createdById,
        type: 'NOTE',
        title: 'Lead creado',
        description: `Origen: ${lead.source}`,
      },
    });
  }

  @OnEvent('lead.stage_changed')
  async onStageChanged(payload: { lead: Lead; fromStageId?: string | null; toStageId: string }) {
    await this.prisma.activity.create({
      data: {
        leadId: payload.lead.id,
        type: 'STAGE_CHANGE',
        title: 'Cambio de etapa',
        metadata: { from: payload.fromStageId, to: payload.toStageId },
      },
    });
  }

  @OnEvent('lead.assigned')
  async onAssigned(lead: Lead) {
    if (!lead.ownerId) return;
    await this.prisma.notification.create({
      data: {
        userId: lead.ownerId,
        type: NotificationType.LEAD_ASSIGNED,
        title: 'Te asignaron un lead',
        body: lead.fullName,
        link: `/leads/${lead.id}`,
      },
    });
  }
}
