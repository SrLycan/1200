import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User, UserRole } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { PaginationDto, buildPagination } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    const { page, pageSize, search } = query;
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return buildPagination(items.map((u) => this.toPublic(u)), total, page, pageSize);
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.deletedAt) throw new NotFoundException('User not found');
    return user;
  }

  async setRole(id: string, role: UserRole) {
    const user = await this.findById(id);
    return this.prisma.user.update({ where: { id: user.id }, data: { role } });
  }

  async deactivate(id: string) {
    const user = await this.findById(id);
    return this.prisma.user.update({ where: { id: user.id }, data: { isActive: false } });
  }

  toPublic(user: User) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
