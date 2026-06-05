import { ApiProperty } from '@nestjs/swagger';
import { StudentStatus } from '#generated/prisma';

export class StudentsPerHeadquarterDto {
  @ApiProperty({ format: 'uuid' })
  headquarterId!: string;

  @ApiProperty({ example: 'Sede Bogotá' })
  headquarterName!: string;

  @ApiProperty({ example: 3 })
  count!: number;
}

export class StudentsPerStatusDto {
  @ApiProperty({ enum: StudentStatus, example: StudentStatus.ACTIVO })
  status!: StudentStatus;

  @ApiProperty({ example: 4 })
  count!: number;
}

export class TopActiveHeadquarterDto {
  @ApiProperty({ format: 'uuid' })
  headquarterId!: string;

  @ApiProperty({ example: 'Sede Bogotá' })
  headquarterName!: string;

  @ApiProperty({ example: 2 })
  activeCount!: number;
}

export class StatsResponseDto {
  @ApiProperty({ type: StudentsPerHeadquarterDto, isArray: true })
  studentsPerHeadquarter!: StudentsPerHeadquarterDto[];

  @ApiProperty({ type: StudentsPerStatusDto, isArray: true })
  studentsPerStatus!: StudentsPerStatusDto[];

  @ApiProperty({ type: TopActiveHeadquarterDto, nullable: true })
  topActiveHeadquarter!: TopActiveHeadquarterDto | null;
}
