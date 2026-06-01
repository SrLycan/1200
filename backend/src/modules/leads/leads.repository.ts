import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

/**
 * Repository pattern: abstrae el acceso a datos del modelo Lead.
 * El servicio no toca Prisma directamente para mejor testeo y substitución futura.
 */
@Injectable()
export class LeadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.LeadCreateInput) {
    return this.prisma.lead.create({ data });
  }

  findById(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: { owner: true, pipelineStage: true, vehicleInterest: true },
    });
  }

  findByPhone(phone: string) {
    return this.prisma.lead.findUnique({ where: { phone } });
  }

  paginate(where: Prisma.LeadWhereInput, page: number, pageSize: number, orderBy: Prisma.LeadOrderByWithRelationInput) {
    return this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        include: { owner: true, pipelineStage: true },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.lead.count({ where }),
    ]);
  }

  update(id: string, data: Prisma.LeadUpdateInput) {
    return this.prisma.lead.update({ where: { id }, data });
  }

  softDelete(id: string) {
    return this.prisma.lead.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  groupByStage() {
    return this.prisma.lead.groupBy({
      by: ['pipelineStageId'],
      _count: { _all: true },
      where: { deletedAt: null },
    });
  }
}
