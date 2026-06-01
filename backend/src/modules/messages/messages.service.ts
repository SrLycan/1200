import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MessageDirection, MessageStatus, MessageType } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('messages-outbound') private readonly outboundQueue: Queue,
  ) {}

  /**
   * Encola un mensaje outbound. Persiste con status PENDING y delega
   * el envío al worker (canal-específico).
   */
  async sendOutbound(dto: SendMessageDto, senderUserId: string) {
    const message = await this.prisma.message.create({
      data: {
        conversationId: dto.conversationId,
        direction: MessageDirection.OUTBOUND,
        type: dto.type ?? MessageType.TEXT,
        body: dto.body,
        mediaUrl: dto.mediaUrl,
        senderUserId,
        status: MessageStatus.PENDING,
      },
    });

    await this.outboundQueue.add('send', { messageId: message.id }, { attempts: 3, backoff: { type: 'exponential', delay: 1500 } });
    return message;
  }

  /**
   * Persiste mensajes inbound desde webhooks (sin pasar por la cola).
   */
  async persistInbound(params: {
    conversationId: string;
    body?: string;
    type?: MessageType;
    mediaUrl?: string;
    externalId?: string;
    raw?: unknown;
  }) {
    const message = await this.prisma.message.create({
      data: {
        conversationId: params.conversationId,
        direction: MessageDirection.INBOUND,
        type: params.type ?? MessageType.TEXT,
        status: MessageStatus.DELIVERED,
        body: params.body,
        mediaUrl: params.mediaUrl,
        externalId: params.externalId,
        raw: params.raw as never,
        deliveredAt: new Date(),
      },
    });

    await this.prisma.conversation.update({
      where: { id: params.conversationId },
      data: {
        lastMessageAt: new Date(),
        unreadCount: { increment: 1 },
        isOpen: true,
      },
    });

    return message;
  }
}
