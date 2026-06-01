import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
  @ApiProperty() @IsUUID()
  conversationId!: string;

  @ApiProperty({ enum: MessageType, required: false })
  @IsOptional() @IsEnum(MessageType)
  type?: MessageType;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  body?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  mediaUrl?: string;
}
