import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { OutboundProcessor } from './queues/outbound.processor';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [
    forwardRef(() => IntegrationsModule),
    BullModule.registerQueue({ name: 'messages-outbound' }),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, OutboundProcessor],
  exports: [MessagesService],
})
export class MessagesModule {}
