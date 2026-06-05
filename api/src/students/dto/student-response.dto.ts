import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StudentStatus } from '#generated/prisma';
import { AuditUserSummaryDto } from '#/users/dto/audit-user-summary.dto';
import { HeadquarterSummaryDto } from '#/users/dto/headquarter-summary.dto';

export class StudentResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'María García López' })
  fullName!: string;

  @ApiProperty({ example: 'maria.garcia@example.com' })
  email!: string;

  @ApiProperty({ example: '+573001234567' })
  phone!: string;

  @ApiProperty({ example: '1012345678' })
  identityCard!: string;

  @ApiProperty({ format: 'uuid' })
  headquarterId!: string;

  @ApiProperty({ type: HeadquarterSummaryDto })
  headquarter!: HeadquarterSummaryDto;

  @ApiProperty({ example: 'Producción Musical' })
  program!: string;

  @ApiProperty({ enum: StudentStatus, example: StudentStatus.ACTIVO })
  status!: StudentStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  enrollmentDate!: Date;

  @ApiProperty({ format: 'uuid', nullable: true })
  createdById!: string | null;

  @ApiProperty({ format: 'uuid', nullable: true })
  updatedById!: string | null;

  @ApiPropertyOptional({ type: AuditUserSummaryDto, nullable: true })
  createdBy!: AuditUserSummaryDto | null;

  @ApiPropertyOptional({ type: AuditUserSummaryDto, nullable: true })
  updatedBy!: AuditUserSummaryDto | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  deletedAt!: Date | null;
}
