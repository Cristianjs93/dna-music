import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '#generated/prisma';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Operador Bogotá', maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ example: 'operador.bog@dnamusic.co', maxLength: 320 })
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @ApiPropertyOptional({ example: 'Oper123!', minLength: 8, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password?: string;

  @ApiPropertyOptional({ enum: Role, example: Role.OPERADOR })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    format: 'uuid',
    nullable: true,
    description: 'Headquarter UUID; null when role is ADMIN',
  })
  @IsOptional()
  @IsUUID()
  headquarterId?: string | null;
}
