import { ApiProperty } from '@nestjs/swagger';
import { StudentStatus } from '#generated/prisma';
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

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  deletedAt!: Date | null;
}
