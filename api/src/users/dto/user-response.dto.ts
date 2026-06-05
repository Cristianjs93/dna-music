import { ApiProperty } from '@nestjs/swagger';
import { Role } from '#generated/prisma';
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

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  deletedAt!: Date | null;
}
