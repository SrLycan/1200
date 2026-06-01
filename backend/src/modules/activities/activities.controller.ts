import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

import { ActivitiesService } from './activities.service';

@ApiTags('activities')
@ApiBearerAuth()
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly svc: ActivitiesService) {}

  @Get('lead/:leadId')
  byLead(@Param('leadId') leadId: string) {
    return this.svc.listByLead(leadId);
  }

  @Post()
  create(@Body() data: Prisma.ActivityCreateInput) {
    return this.svc.create(data);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.svc.complete(id);
  }
}
