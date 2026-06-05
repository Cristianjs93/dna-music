import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '#generated/prisma';
import { Roles } from '#/auth/decorators/roles.decorator';
import { CreateHeadquarterDto } from './dto/create-headquarter.dto';
import { UpdateHeadquarterDto } from './dto/update-headquarter.dto';
import { HeadquarterResponseDto } from './dto/headquarter-response.dto';
import { HeadquartersService } from './headquarters.service';

@ApiTags('headquarters')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
@ApiForbiddenResponse({ description: 'ADMIN role required' })
@Roles(Role.ADMIN)
@Controller('headquarters')
export class HeadquartersController {
  constructor(private readonly headquartersService: HeadquartersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a headquarter (ADMIN only)' })
  @ApiCreatedResponse({ type: HeadquarterResponseDto })
  @ApiConflictResponse({ description: 'Headquarter name already exists' })
  create(@Body() createHeadquarterDto: CreateHeadquarterDto): Promise<HeadquarterResponseDto> {
    return this.headquartersService.create(createHeadquarterDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all active headquarters (ADMIN only)' })
  @ApiOkResponse({ type: HeadquarterResponseDto, isArray: true })
  findAll(): Promise<HeadquarterResponseDto[]> {
    return this.headquartersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a headquarter by ID (ADMIN only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: HeadquarterResponseDto })
  @ApiNotFoundResponse({ description: 'Headquarter not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<HeadquarterResponseDto> {
    return this.headquartersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a headquarter (ADMIN only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: HeadquarterResponseDto })
  @ApiNotFoundResponse({ description: 'Headquarter not found' })
  @ApiConflictResponse({ description: 'Headquarter name already exists' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHeadquarterDto: UpdateHeadquarterDto,
  ): Promise<HeadquarterResponseDto> {
    return this.headquartersService.update(id, updateHeadquarterDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a headquarter (ADMIN only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: HeadquarterResponseDto })
  @ApiNotFoundResponse({ description: 'Headquarter not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<HeadquarterResponseDto> {
    return this.headquartersService.remove(id);
  }
}
