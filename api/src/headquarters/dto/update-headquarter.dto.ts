import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateHeadquarterDto {
  @ApiPropertyOptional({ example: 'Sede Bogotá', maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ example: 'Bogotá', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'Carrera 15 # 88-64, Bogotá D.C.', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;
}
