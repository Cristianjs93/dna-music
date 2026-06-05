import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '#generated/prisma';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

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

  @ApiPropertyOptional({ enum: Role, example: Role.OPERADOR, description: 'ADMIN only' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    format: 'uuid',
    nullable: true,
    description: 'Headquarter UUID; null when role is ADMIN. ADMIN only.',
  })
  @IsOptional()
  @IsUUID()
  headquarterId?: string | null;
}
