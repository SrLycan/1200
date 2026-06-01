import { Module, forwardRef } from '@nestjs/common';

import { WhatsappService } from './whatsapp/whatsapp.service';
import { WhatsappWebhookController } from './whatsapp/whatsapp.webhook.controller';
import { InstagramService } from './instagram/instagram.service';
import { InstagramWebhookController } from './instagram/instagram.webhook.controller';
import { WebhookHandlerService } from './webhook-handler.service';

import { LeadsModule } from '../leads/leads.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [LeadsModule, forwardRef(() => MessagesModule)],
  controllers: [WhatsappWebhookController, InstagramWebhookController],
  providers: [WhatsappService, InstagramService, WebhookHandlerService],
  exports: [WhatsappService, InstagramService, WebhookHandlerService],
})
export class IntegrationsModule {}
