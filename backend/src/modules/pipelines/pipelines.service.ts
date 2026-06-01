import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PipelinesService {
  constructor(private readonly prisma: PrismaService) {}

  listStages() {
    return this.prisma.pipelineStage.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async kanban() {
    const stages = await this.listStages();
    const stageIds = stages.map((s) => s.id);
    const leads = await this.prisma.lead.findMany({
      where: { deletedAt: null, pipelineStageId: { in: stageIds } },
      include: { owner: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return stages.map((s) => ({
      ...s,
      leads: leads.filter((l) => l.pipelineStageId === s.id),
    }));
  }

  reorder(items: { id: string; order: number }[]) {
    return this.prisma.$transaction(
      items.map((i) => this.prisma.pipelineStage.update({ where: { id: i.id }, data: { order: i.order } })),
    );
  }
}
