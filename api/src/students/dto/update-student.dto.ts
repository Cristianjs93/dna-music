import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateStudentDto {
  @ApiPropertyOptional({ example: 'María García López', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @ApiPropertyOptional({ example: 'maria.garcia@example.com', maxLength: 320 })
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @ApiPropertyOptional({ example: '+573001234567', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: '1012345678', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  identityCard?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'ADMIN only' })
  @IsOptional()
  @IsUUID()
  headquarterId?: string;

  @ApiPropertyOptional({ example: 'Producción Musical', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  program?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  enrollmentDate?: string;
}
