import { ApiProperty } from '@nestjs/swagger';

export class HeadquarterSummaryDto {
  @ApiProperty({ format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Sede Bogotá' })
  name!: string;

  @ApiProperty({ example: 'Bogotá' })
  city!: string;
}
