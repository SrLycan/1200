import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

/**
 * Round-robin de leads entre asesores activos.
 * Estrategia escalable: en v2 leerá load real desde Redis (open conversations).
 */
@Injectable()
export class LeadAssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  async pickOwner(): Promise<string | null> {
    const asesores = await this.prisma.user.findMany({
      where: { role: UserRole.ASESOR, isActive: true, deletedAt: null },
      select: { id: true, _count: { select: { leadsOwned: { where: { closedAt: null } } } } },
    });
    if (asesores.length === 0) return null;

    asesores.sort((a, b) => a._count.leadsOwned - b._count.leadsOwned);
    return asesores[0].id;
  }
}
