import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.svc.list(userId);
  }

  @Get('unread-count')
  unread(@CurrentUser('id') userId: string) {
    return this.svc.unreadCount(userId).then((count) => ({ count }));
  }

  @Patch('read-all')
  readAll(@CurrentUser('id') userId: string) {
    return this.svc.markAllRead(userId);
  }

  @Patch(':id/read')
  read(@Param('id') id: string) {
    return this.svc.markRead(id);
  }
}
