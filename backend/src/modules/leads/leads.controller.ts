import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { FilterLeadsDto } from './dto/filter-leads.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('leads')
@ApiBearerAuth()
@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Post()
  create(@Body() dto: CreateLeadDto, @CurrentUser('id') userId: string) {
    return this.leads.create(dto, userId);
  }

  @Get()
  findAll(@Query() filter: FilterLeadsDto) {
    return this.leads.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leads.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leads.update(id, dto);
  }

  @Patch(':id/stage/:stageId')
  moveStage(@Param('id') id: string, @Param('stageId') stageId: string) {
    return this.leads.moveStage(id, stageId);
  }

  @Patch(':id/assign/:ownerId')
  @Roles(UserRole.ADMIN, UserRole.GERENCIA, UserRole.SUPERVISOR)
  assign(@Param('id') id: string, @Param('ownerId') ownerId: string) {
    return this.leads.assign(id, ownerId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.GERENCIA)
  remove(@Param('id') id: string) {
    return this.leads.remove(id);
  }
}
