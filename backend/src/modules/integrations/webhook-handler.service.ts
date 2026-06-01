import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChannelType, LeadSource, MessageType } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { LeadsService } from '../leads/leads.service';
import { MessagesService } from '../messages/messages.service';

/**
 * Orquesta los payloads inbound desde WhatsApp/Instagram:
 *  1. Crea/recupera conversación
 *  2. Si el contacto no existe → crea Lead (autoassign + scoring)
 *  3. Persiste mensaje
 *  4. Emite eventos para listeners (notificación, automatización)
 */
@Injectable()
export class WebhookHandlerService {
  private readonly logger = new Logger(WebhookHandlerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly leads: LeadsService,
    private readonly messages: MessagesService,
    private readonly events: EventEmitter2,
  ) {}

  async handleWhatsapp(payload: any) {
    const entries = payload?.entry ?? [];
    for (const entry of entries) {
      for (const change of entry.changes ?? []) {
        const value = change.value ?? {};
        const contacts = value.contacts ?? [];
        const incoming = value.messages ?? [];

        for (const msg of incoming) {
          const waId: string = msg.from;
          const contactName: string =
            contacts.find((c: any) => c.wa_id === waId)?.profile?.name ?? waId;

          const conv = await this.ensureConversation({
            channel: ChannelType.WHATSAPP,
            externalId: waId,
            contactName,
            phone: waId,
            source: LeadSource.WHATSAPP,
          });

          await this.messages.persistInbound({
            conversationId: conv.id,
            body: msg.text?.body,
            type: this.mapWhatsappType(msg.type),
            externalId: msg.id,
            raw: msg,
          });

          this.events.emit('inbound.message', { channel: ChannelType.WHATSAPP, conversationId: conv.id });
        }
      }
    }
  }

  async handleInstagram(payload: any) {
    const entries = payload?.entry ?? [];
    for (const entry of entries) {
      const messaging = entry.messaging ?? [];
      for (const m of messaging) {
        if (!m.message) continue;
        const senderId = m.sender.id;
        const conv = await this.ensureConversation({
          channel: ChannelType.INSTAGRAM,
          externalId: senderId,
          contactName: `IG ${senderId}`,
          source: LeadSource.INSTAGRAM,
        });

        await this.messages.persistInbound({
          conversationId: conv.id,
          body: m.message.text,
          type: m.message.attachments ? MessageType.IMAGE : MessageType.TEXT,
          externalId: m.message.mid,
          raw: m,
        });

        this.events.emit('inbound.message', { channel: ChannelType.INSTAGRAM, conversationId: conv.id });
      }
    }
  }

  // ----------- helpers -----------

  private async ensureConversation(p: {
    channel: ChannelType;
    externalId: string;
    contactName: string;
    phone?: string;
    source: LeadSource;
  }) {
    let conv = await this.prisma.conversation.findUnique({
      where: { channel_externalId: { channel: p.channel, externalId: p.externalId } },
    });

    if (conv) return conv;

    // No existe → crear lead + conversación
    const existingLead = p.phone
      ? await this.prisma.lead.findUnique({ where: { phone: p.phone } })
      : null;

    const lead =
      existingLead ??
      (await this.leads.create({
        fullName: p.contactName,
        phone: p.phone,
        source: p.source,
      }));

    conv = await this.prisma.conversation.create({
      data: {
        channel: p.channel,
        externalId: p.externalId,
        leadId: lead.id,
        assignedToId: lead.ownerId,
        lastMessageAt: new Date(),
      },
    });

    return conv;
  }

  private mapWhatsappType(t: string): MessageType {
    switch (t) {
      case 'image': return MessageType.IMAGE;
      case 'audio': return MessageType.AUDIO;
      case 'video': return MessageType.VIDEO;
      case 'document': return MessageType.DOCUMENT;
      case 'location': return MessageType.LOCATION;
      case 'interactive': return MessageType.INTERACTIVE;
      case 'template': return MessageType.TEMPLATE;
      default: return MessageType.TEXT;
    }
  }
}
