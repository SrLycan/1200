import { Injectable, NotFoundException } from '@nestjs/common';
import { ChannelType, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto, buildPagination } from '../../common/dto/pagination.dto';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationDto & { channel?: ChannelType; assignedToId?: string }) {
    const { page, pageSize, channel, assignedToId, search } = query;
    const where: Prisma.ConversationWhereInput = {
      ...(channel && { channel }),
      ...(assignedToId && { assignedToId }),
      ...(search && {
        OR: [
          { externalId: { contains: search } },
          { lead: { fullName: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.conversation.findMany({
        where,
        include: {
          lead: true,
          assignedTo: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          messages: { take: 1, orderBy: { createdAt: 'desc' } },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.conversation.count({ where }),
    ]);
    return buildPagination(items, total, page, pageSize);
  }

  async findOne(id: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        lead: true,
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }

  async messages(id: string, pagination: PaginationDto) {
    const { page, pageSize } = pagination;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where: { conversationId: id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.message.count({ where: { conversationId: id } }),
    ]);
    return buildPagination(items.reverse(), total, page, pageSize);
  }

  async assign(id: string, userId: string) {
    return this.prisma.conversation.update({
      where: { id },
      data: { assignedToId: userId },
    });
  }

  async markRead(id: string) {
    return this.prisma.conversation.update({
      where: { id },
      data: { unreadCount: 0 },
    });
  }

  async close(id: string) {
    return this.prisma.conversation.update({
      where: { id },
      data: { isOpen: false, closedAt: new Date() },
    });
  }
}
