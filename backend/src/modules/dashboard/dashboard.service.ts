import { Injectable } from '@nestjs/common';
import { LeadStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async kpis() {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [totalLeads, newLeads, wonLeads, openConvs, unreadMsgs] = await Promise.all([
      this.prisma.lead.count({ where: { deletedAt: null } }),
      this.prisma.lead.count({ where: { deletedAt: null, createdAt: { gte: since } } }),
      this.prisma.lead.count({ where: { deletedAt: null, status: LeadStatus.WON, closedAt: { gte: since } } }),
      this.prisma.conversation.count({ where: { isOpen: true } }),
      this.prisma.conversation.aggregate({ _sum: { unreadCount: true } }),
    ]);

    const conversionRate = totalLeads > 0 ? Number(((wonLeads / totalLeads) * 100).toFixed(2)) : 0;

    return {
      totalLeads,
      newLeadsLast30: newLeads,
      wonLeadsLast30: wonLeads,
      openConversations: openConvs,
      unreadMessages: unreadMsgs._sum.unreadCount ?? 0,
      conversionRate,
    };
  }

  async leadsBySource() {
    const grouped = await this.prisma.lead.groupBy({
      by: ['source'],
      _count: { _all: true },
      where: { deletedAt: null },
    });
    return grouped.map((g) => ({ source: g.source, count: g._count._all }));
  }

  async leadsByStage() {
    const stages = await this.prisma.pipelineStage.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    const leads = await this.prisma.lead.groupBy({
      by: ['pipelineStageId'],
      _count: { _all: true },
      where: { deletedAt: null },
    });
    return stages.map((s) => ({
      stage: s.name,
      color: s.color,
      count: leads.find((l) => l.pipelineStageId === s.id)?._count._all ?? 0,
    }));
  }
}
