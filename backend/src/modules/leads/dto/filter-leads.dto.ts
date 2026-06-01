import { ApiProperty } from '@nestjs/swagger';
import { LeadSource, LeadStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterLeadsDto extends PaginationDto {
  @ApiProperty({ enum: LeadStatus, required: false })
  @IsOptional() @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiProperty({ enum: LeadSource, required: false })
  @IsOptional() @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiProperty({ required: false })
  @IsOptional() @IsUUID()
  ownerId?: string;
}
