import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MessageStatus } from '@prisma/client';

import { PrismaService } from '../../../database/prisma.service';
import { WhatsappService } from '../../integrations/whatsapp/whatsapp.service';
import { InstagramService } from '../../integrations/instagram/instagram.service';

@Processor('messages-outbound')
export class OutboundProcessor extends WorkerHost {
  private readonly logger = new Logger(OutboundProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsapp: WhatsappService,
    private readonly instagram: InstagramService,
  ) {
    super();
  }

  async process(job: Job<{ messageId: string }>) {
    const message = await this.prisma.message.findUnique({
      where: { id: job.data.messageId },
      include: { conversation: true },
    });
    if (!message) return;

    try {
      let externalId: string | undefined;

      if (message.conversation.channel === 'WHATSAPP') {
        externalId = await this.whatsapp.sendText(message.conversation.externalId, message.body ?? '');
      } else if (message.conversation.channel === 'INSTAGRAM') {
        externalId = await this.instagram.sendText(message.conversation.externalId, message.body ?? '');
      } else {
        throw new Error(`Channel ${message.conversation.channel} not implemented`);
      }

      await this.prisma.message.update({
        where: { id: message.id },
        data: { status: MessageStatus.SENT, externalId, deliveredAt: new Date() },
      });

      await this.prisma.conversation.update({
        where: { id: message.conversationId },
        data: { lastMessageAt: new Date() },
      });
    } catch (err) {
      this.logger.error(`Failed to send ${message.id}`, err as Error);
      await this.prisma.message.update({
        where: { id: message.id },
        data: { status: MessageStatus.FAILED, errorMessage: (err as Error).message },
      });
      throw err;
    }
  }
}
