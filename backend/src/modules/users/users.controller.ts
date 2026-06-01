import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEnum } from 'class-validator';

import { UsersService } from './users.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class UpdateRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.GERENCIA, UserRole.SUPERVISOR)
  list(@Query() query: PaginationDto) {
    return this.users.findAll(query);
  }

  @Get('me')
  me(@CurrentUser('id') id: string) {
    return this.users.findById(id).then((u) => this.users.toPublic(u));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.GERENCIA, UserRole.SUPERVISOR)
  findOne(@Param('id') id: string) {
    return this.users.findById(id).then((u) => this.users.toPublic(u));
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  updateRole(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    return this.users.setRole(id, body.role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  deactivate(@Param('id') id: string) {
    return this.users.deactivate(id);
  }
}
