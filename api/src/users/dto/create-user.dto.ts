import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '#generated/prisma';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Operador Bogotá', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @ApiProperty({ example: 'operador.bog@dnamusic.co', maxLength: 320 })
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ example: 'Oper123!', minLength: 8, maxLength: 100 })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @ApiProperty({ enum: Role, example: Role.OPERADOR })
  @IsEnum(Role)
  role!: Role;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Required when role is OPERADOR; must be omitted for ADMIN',
  })
  @IsOptional()
  @IsUUID()
  headquarterId?: string;
}
