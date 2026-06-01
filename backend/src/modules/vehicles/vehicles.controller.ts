import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole, VehicleStatus, Prisma } from '@prisma/client';

import { VehiclesService } from './vehicles.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('vehicles')
@ApiBearerAuth()
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly svc: VehiclesService) {}

  @Get()
  list(@Query() q: PaginationDto, @Query('status') status?: VehicleStatus) {
    return this.svc.list({ ...q, status });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.GERENCIA, UserRole.SUPERVISOR)
  create(@Body() data: Prisma.VehicleCreateInput) {
    return this.svc.create(data);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.GERENCIA, UserRole.SUPERVISOR)
  update(@Param('id') id: string, @Body() data: Prisma.VehicleUpdateInput) {
    return this.svc.update(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.GERENCIA)
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
