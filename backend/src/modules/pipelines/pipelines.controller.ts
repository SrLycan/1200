import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { PipelinesService } from './pipelines.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('pipelines')
@ApiBearerAuth()
@Controller('pipelines')
export class PipelinesController {
  constructor(private readonly svc: PipelinesService) {}

  @Get('stages')
  stages() {
    return this.svc.listStages();
  }

  @Get('kanban')
  kanban() {
    return this.svc.kanban();
  }

  @Patch('stages/reorder')
  @Roles(UserRole.ADMIN, UserRole.GERENCIA)
  reorder(@Body() body: { items: { id: string; order: number }[] }) {
    return this.svc.reorder(body.items);
  }
}
