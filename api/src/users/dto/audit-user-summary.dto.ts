import { ApiProperty } from '@nestjs/swagger';

export class AuditUserSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Administrador DNA Music' })
  name!: string;

  @ApiProperty({ example: 'admin@dnamusic.co' })
  email!: string;
}
