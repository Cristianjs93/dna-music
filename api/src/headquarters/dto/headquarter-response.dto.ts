import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditUserSummaryDto } from '#/users/dto/audit-user-summary.dto';

export class HeadquarterResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Sede Bogotá' })
  name!: string;

  @ApiProperty({ example: 'Bogotá' })
  city!: string;

  @ApiProperty({ example: 'Carrera 15 # 88-64, Bogotá D.C.' })
  address!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

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
