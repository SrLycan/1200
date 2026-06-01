import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty() @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8)
  password!: string;

  @ApiProperty() @IsString()
  firstName!: string;

  @ApiProperty() @IsString()
  lastName!: string;

  @ApiProperty({ enum: UserRole, required: false, default: UserRole.ASESOR })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole = UserRole.ASESOR;
}
