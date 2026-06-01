import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChannelType } from '@prisma/client';

import { ConversationsService } from './conversations.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('conversations')
@ApiBearerAuth()
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly svc: ConversationsService) {}

  @Get()
  list(
    @Query() pagination: PaginationDto,
    @Query('channel') channel?: ChannelType,
    @Query('assignedToId') assignedToId?: string,
  ) {
    return this.svc.list({ ...pagination, channel, assignedToId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Get(':id/messages')
  messages(@Param('id') id: string, @Query() pagination: PaginationDto) {
    return this.svc.messages(id, pagination);
  }

  @Patch(':id/assign/:userId')
  assign(@Param('id') id: string, @Param('userId') userId: string) {
    return this.svc.assign(id, userId);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.svc.markRead(id);
  }

  @Patch(':id/close')
  close(@Param('id') id: string) {
    return this.svc.close(id);
  }
}
