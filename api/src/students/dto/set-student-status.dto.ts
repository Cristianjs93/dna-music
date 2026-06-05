import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetStudentStatusDto {
  @ApiProperty({ example: true, description: 'true to activate, false to deactivate' })
  @IsBoolean()
  isActive!: boolean;
}
