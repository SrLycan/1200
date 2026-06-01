import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private readonly svc: MessagesService) {}

  @Post()
  send(@Body() dto: SendMessageDto, @CurrentUser('id') userId: string) {
    return this.svc.sendOutbound(dto, userId);
  }
}
