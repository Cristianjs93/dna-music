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
import { CurrentUser } from '#/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '#/auth/interfaces/authenticated-user.interface';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { SetStudentStatusDto } from './dto/set-student-status.dto';
import { StudentResponseDto } from './dto/student-response.dto';
import { StudentsService } from './students.service';

@ApiTags('students')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
@ApiForbiddenResponse({ description: 'Insufficient permissions or branch scope violation' })
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a student (ADMIN: any branch; OPERADOR: own branch only)',
  })
  @ApiCreatedResponse({ type: StudentResponseDto })
  @ApiConflictResponse({ description: 'Unique field conflict' })
  create(
    @Body() createStudentDto: CreateStudentDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<StudentResponseDto> {
    return this.studentsService.create(createStudentDto, actor);
  }

  @Get()
  @ApiOperation({
    summary: 'List students (ADMIN: all branches; OPERADOR: own branch only)',
  })
  @ApiOkResponse({ type: StudentResponseDto, isArray: true })
  findAll(@CurrentUser() actor: AuthenticatedUser): Promise<StudentResponseDto[]> {
    return this.studentsService.findAll(actor);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a student by ID (scoped by branch for OPERADOR)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: StudentResponseDto })
  @ApiNotFoundResponse({ description: 'Student not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<StudentResponseDto> {
    return this.studentsService.findOne(id, actor);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Activate or deactivate a student (scoped by branch for OPERADOR)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: StudentResponseDto })
  @ApiNotFoundResponse({ description: 'Student not found' })
  setStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() setStudentStatusDto: SetStudentStatusDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<StudentResponseDto> {
    return this.studentsService.setStatus(id, setStudentStatusDto, actor);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update student details (scoped by branch for OPERADOR)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: StudentResponseDto })
  @ApiNotFoundResponse({ description: 'Student not found' })
  @ApiConflictResponse({ description: 'Unique field conflict' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<StudentResponseDto> {
    return this.studentsService.update(id, updateStudentDto, actor);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a student (scoped by branch for OPERADOR)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: StudentResponseDto })
  @ApiNotFoundResponse({ description: 'Student not found' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<StudentResponseDto> {
    return this.studentsService.remove(id, actor);
  }
}
