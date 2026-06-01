import { ApiProperty } from '@nestjs/swagger';
import { LeadPriority, LeadSource } from '@prisma/client';
import { IsArray, IsEmail, IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLeadDto {
  @ApiProperty() @IsString()
  fullName!: string;

  @ApiProperty({ required: false }) @IsOptional() @IsEmail()
  email?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString()
  phone?: string;

  @ApiProperty({ enum: LeadSource }) @IsEnum(LeadSource)
  source!: LeadSource;

  @ApiProperty({ enum: LeadPriority, required: false })
  @IsOptional() @IsEnum(LeadPriority)
  priority?: LeadPriority;

  @ApiProperty({ required: false }) @IsOptional() @IsString()
  city?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString()
  notes?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false }) @IsOptional() @IsObject()
  utm?: Record<string, string>;

  @ApiProperty({ required: false }) @IsOptional() @IsUUID()
  ownerId?: string;
}
