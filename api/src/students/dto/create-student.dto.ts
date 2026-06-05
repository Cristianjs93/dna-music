import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StudentStatus } from '#generated/prisma';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'María García López', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName!: string;

  @ApiProperty({ example: 'maria.garcia@example.com', maxLength: 320 })
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ example: '+573001234567', maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone!: string;

  @ApiProperty({ example: '1012345678', maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  identityCard!: string;

  @ApiProperty({ format: 'uuid', description: 'Required for ADMIN; ignored for OPERADOR' })
  @IsOptional()
  @IsUUID()
  headquarterId?: string;

  @ApiProperty({ example: 'Producción Musical', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  program!: string;

  @ApiPropertyOptional({ enum: StudentStatus, example: StudentStatus.ACTIVO })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  enrollmentDate?: string;
}
