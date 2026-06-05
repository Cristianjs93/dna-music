import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '#generated/prisma';
import { AuditUserSummaryDto } from './audit-user-summary.dto';
import { HeadquarterSummaryDto } from './headquarter-summary.dto';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Administrador DNA Music' })
  name!: string;

  @ApiProperty({ example: 'admin@dnamusic.co' })
  email!: string;

  @ApiProperty({ enum: Role, example: Role.ADMIN })
  role!: Role;

  @ApiProperty({
    format: 'uuid',
    nullable: true,
    description: 'Assigned headquarter for OPERADOR; null for ADMIN',
  })
  headquarterId!: string | null;

  @ApiProperty({ type: HeadquarterSummaryDto, nullable: true })
  headquarter!: HeadquarterSummaryDto | null;

  @ApiProperty({
    format: 'uuid',
    nullable: true,
    description: 'User who created this record',
  })
  createdById!: string | null;

  @ApiProperty({
    format: 'uuid',
    nullable: true,
    description: 'User who last modified this record',
  })
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
