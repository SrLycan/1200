import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, VehicleStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto, buildPagination } from '../../common/dto/pagination.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationDto & { status?: VehicleStatus }) {
    const { page, pageSize, search, status } = query;
    const where: Prisma.VehicleWhereInput = {
      deletedAt: null,
      ...(status && { status }),
      ...(search && {
        OR: [
          { make: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { vin: { contains: search } },
          { plate: { contains: search } },
        ],
      }),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.vehicle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.vehicle.count({ where }),
    ]);
    return buildPagination(items, total, page, pageSize);
  }

  async findOne(id: string) {
    const v = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!v || v.deletedAt) throw new NotFoundException('Vehicle not found');
    return v;
  }

  create(data: Prisma.VehicleCreateInput) {
    return this.prisma.vehicle.create({ data });
  }

  update(id: string, data: Prisma.VehicleUpdateInput) {
    return this.prisma.vehicle.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.vehicle.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
