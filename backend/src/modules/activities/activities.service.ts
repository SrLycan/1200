import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  listByLead(leadId: string) {
    return this.prisma.activity.findMany({
      where: { leadId },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: Prisma.ActivityCreateInput) {
    return this.prisma.activity.create({ data });
  }

  complete(id: string) {
    return this.prisma.activity.update({
      where: { id },
      data: { completedAt: new Date() },
    });
  }
}
