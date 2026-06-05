import { Injectable, Logger } from '@nestjs/common';
import { Role, type Prisma, StudentStatus } from '#generated/prisma';
import { AUTH_DOMAIN_ERRORS } from '#/auth/constants/auth-errors.constants';
import type { AuthenticatedUser } from '#/auth/interfaces/authenticated-user.interface';
import { USER_DOMAIN_ERRORS } from '#/users/constants/user-errors.constants';
import { PrismaService } from '#/prisma/prisma.service';
import { isDefined, nonEmptyStringOrUndefined } from '#util/parse.utils';
import { domainException } from '#util/errors/domain-error.utils';
import { rethrowPrismaKnownError } from '#util/errors/prisma-error.utils';
import { studentPublicSelect, type StudentPublic } from './constants/student-public.select';
import { STUDENT_DOMAIN_ERRORS, STUDENT_PRISMA_ERRORS } from './constants/student-errors.constants';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { SetStudentStatusDto } from './dto/set-student-status.dto';
import { auditOnCreate, auditOnUpdate } from '#util/audit/audit.constants';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a student. ADMIN must supply headquarterId; OPERADOR is assigned to their branch.
   * @param createStudentDto - Student fields from the request body.
   * @param actor - Authenticated user performing the action.
   */
  async create(
    createStudentDto: CreateStudentDto,
    actor: AuthenticatedUser,
  ): Promise<StudentPublic> {
    const headquarterId = this.resolveHeadquarterIdForWrite(createStudentDto.headquarterId, actor);

    this.logger.log(
      `Creating student email=${createStudentDto.email} headquarterId=${headquarterId}`,
    );

    await this.validateHeadquarter(headquarterId);

    try {
      const student = await this.prisma.student.create({
        data: {
          fullName: createStudentDto.fullName,
          email: createStudentDto.email,
          phone: createStudentDto.phone,
          identityCard: createStudentDto.identityCard,
          program: createStudentDto.program,
          status: createStudentDto.status ?? StudentStatus.ACTIVO,
          enrollmentDate: isDefined(createStudentDto.enrollmentDate)
            ? new Date(createStudentDto.enrollmentDate)
            : undefined,
          headquarterId,
          ...auditOnCreate(actor.id),
        },
        select: studentPublicSelect,
      });

      this.logger.log(`Student created id=${student.id}`);
      return student;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to create student email=${createStudentDto.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      rethrowPrismaKnownError(error, STUDENT_PRISMA_ERRORS);
    }
  }

  /**
   * Lists non-deleted students. ADMIN sees all branches; OPERADOR only their headquarter.
   * @param actor - Authenticated user performing the action.
   */
  async findAll(actor: AuthenticatedUser): Promise<StudentPublic[]> {
    this.logger.log(`Listing students actorId=${actor.id}`);

    const where = this.buildListWhere(actor);

    const students = await this.prisma.student.findMany({
      where,
      select: studentPublicSelect,
      orderBy: { createdAt: 'desc' },
    });

    this.logger.log(`Students listed successfully`);
    return students;
  }

  /**
   * Returns one student by id after verifying branch access for OPERADOR.
   * @param id - Student UUID.
   * @param actor - Authenticated user performing the action.
   */
  async findOne(id: string, actor: AuthenticatedUser): Promise<StudentPublic> {
    this.logger.log(`Fetching student id=${id}`);

    const student = await this.prisma.student.findFirst({
      where: { id, deletedAt: null },
      select: studentPublicSelect,
    });

    if (!isDefined(student)) {
      this.logger.error(`Student not found id=${id}`);
      throw domainException(STUDENT_DOMAIN_ERRORS.studentNotFound);
    }

    this.assertBranchAccess(student.headquarterId, actor);
    return student;
  }

  /**
   * Updates student details (not status). OPERADOR cannot change headquarterId.
   * @param id - Student UUID.
   * @param updateStudentDto - Fields to update.
   * @param actor - Authenticated user performing the action.
   */
  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
    actor: AuthenticatedUser,
  ): Promise<StudentPublic> {
    this.logger.log(`Updating student id=${id}`);

    const current = await this.prisma.student.findFirst({
      where: { id, deletedAt: null },
      select: { headquarterId: true },
    });

    if (!isDefined(current)) {
      this.logger.error(`Student not found id=${id}`);
      throw domainException(STUDENT_DOMAIN_ERRORS.studentNotFound);
    }

    this.assertBranchAccess(current.headquarterId, actor);

    if (actor.role === Role.OPERADOR && isDefined(updateStudentDto.headquarterId)) {
      this.logger.error(
        `Privileged fields not allowed actor role=${actor.role} headquarterId=${updateStudentDto.headquarterId}`,
      );
      throw domainException(AUTH_DOMAIN_ERRORS.privilegedFieldsNotAllowed);
    }

    const headquarterId =
      actor.role === Role.ADMIN
        ? (updateStudentDto.headquarterId ?? current.headquarterId)
        : current.headquarterId;

    // Validate if the headquarterId is valid
    if (headquarterId !== current.headquarterId) {
      await this.validateHeadquarter(headquarterId);
    }

    const data: Prisma.StudentUncheckedUpdateInput = {
      fullName: nonEmptyStringOrUndefined(updateStudentDto.fullName),
      email: nonEmptyStringOrUndefined(updateStudentDto.email),
      phone: nonEmptyStringOrUndefined(updateStudentDto.phone),
      identityCard: nonEmptyStringOrUndefined(updateStudentDto.identityCard),
      program: nonEmptyStringOrUndefined(updateStudentDto.program),
      enrollmentDate: isDefined(updateStudentDto.enrollmentDate)
        ? new Date(updateStudentDto.enrollmentDate)
        : undefined,
      headquarterId,
      ...auditOnUpdate(actor.id),
    };

    try {
      const student = await this.prisma.student.update({
        where: { id },
        data,
        select: studentPublicSelect,
      });

      this.logger.log(`Student updated id=${id}`);
      return student;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to update student id=${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      rethrowPrismaKnownError(error, STUDENT_PRISMA_ERRORS);
    }
  }

  /**
   * Activates (ACTIVO) or deactivates (INACTIVO) a student; validates branch access.
   * @param id - Student UUID.
   * @param dto - `{ isActive: true | false }`.
   * @param actor - Authenticated user performing the action.
   */
  async setStatus(
    id: string,
    dto: SetStudentStatusDto,
    actor: AuthenticatedUser,
  ): Promise<StudentPublic> {
    const status = dto.isActive ? StudentStatus.ACTIVO : StudentStatus.INACTIVO;

    this.logger.log(`Setting student id=${id} status=${status}`);

    const current = await this.prisma.student.findFirst({
      where: { id, deletedAt: null },
      select: { headquarterId: true },
    });

    if (!isDefined(current)) {
      this.logger.error(`Student not found id=${id}`);
      throw domainException(STUDENT_DOMAIN_ERRORS.studentNotFound);
    }

    this.assertBranchAccess(current.headquarterId, actor);

    if (dto.isActive) {
      await this.validateHeadquarter(current.headquarterId);
    }

    try {
      const student = await this.prisma.student.update({
        where: { id },
        data: { status, ...auditOnUpdate(actor.id) },
        select: studentPublicSelect,
      });

      this.logger.log(`Student status updated id=${id} status=${student.status}`);
      return student;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to update student status id=${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      rethrowPrismaKnownError(error, STUDENT_PRISMA_ERRORS);
    }
  }

  /**
   * Soft-deletes a student and sets status to RETIRADO after verifying branch access.
   * @param id - Student UUID.
   * @param actor - Authenticated user performing the action.
   */
  async remove(id: string, actor: AuthenticatedUser): Promise<StudentPublic> {
    this.logger.log(`Soft-deleting student id=${id}`);

    const current = await this.prisma.student.findFirst({
      where: { id, deletedAt: null },
      select: { headquarterId: true },
    });

    if (!isDefined(current)) {
      throw domainException(STUDENT_DOMAIN_ERRORS.studentNotFound);
    }

    this.assertBranchAccess(current.headquarterId, actor);

    try {
      const student = await this.prisma.student.update({
        where: { id },
        data: {
          status: StudentStatus.RETIRADO,
          deletedAt: new Date(),
          ...auditOnUpdate(actor.id),
        },
        select: studentPublicSelect,
      });

      this.logger.log(`Student soft-deleted id=${id}`);
      return student;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to soft-delete student id=${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      rethrowPrismaKnownError(error, STUDENT_PRISMA_ERRORS);
    }
  }

  /** Builds the Prisma filter for list queries scoped by actor role.
   * @param actor Authenticated caller.
   * */
  private buildListWhere(actor: AuthenticatedUser): Prisma.StudentWhereInput {
    const base: Prisma.StudentWhereInput = { deletedAt: null };

    if (actor.role === Role.ADMIN) {
      return base;
    }

    const headquarterId = this.getOperatorHeadquarterId(actor);
    return { ...base, headquarterId };
  }

  /**
   * Resolves headquarterId on create. ADMIN: any valid id from DTO. OPERADOR: DTO must match their branch.
   * @param dtoHeadquarterId - headquarterId from the request body.
   * @param actor - Authenticated user performing the action.
   */
  private resolveHeadquarterIdForWrite(
    dtoHeadquarterId: string | undefined,
    actor: AuthenticatedUser,
  ): string {
    if (actor.role === Role.ADMIN) {
      if (!isDefined(dtoHeadquarterId)) {
        this.logger.error(`Headquarter not found for ADMIN headquarterId=${dtoHeadquarterId}`);
        throw domainException(STUDENT_DOMAIN_ERRORS.headquarterNotFound);
      }

      return dtoHeadquarterId;
    }

    const actorHeadquarterId = this.getOperatorHeadquarterId(actor);

    if (dtoHeadquarterId !== actorHeadquarterId) {
      this.logger.warn(
        `OPERADOR headquarter mismatch dto=${dtoHeadquarterId} actor=${actorHeadquarterId}`,
      );
      throw domainException(STUDENT_DOMAIN_ERRORS.operatorHeadquarterMismatch);
    }

    return actorHeadquarterId;
  }

  /** Returns the OPERADOR's assigned headquarterId or throws if missing.
   * @param actor Authenticated OPERADOR.
   * */
  private getOperatorHeadquarterId(actor: AuthenticatedUser): string {
    this.logger.log(`Getting operator headquarterId for actor id=${actor.id}`);

    if (!isDefined(actor.headquarterId)) {
      this.logger.error(`Operator missing headquarter id=${actor.id}`);
      throw domainException(USER_DOMAIN_ERRORS.operatorMissingHeadquarter);
    }

    return actor.headquarterId;
  }

  /**
   * Ensures OPERADOR can only access data from their branch; ADMIN passes unconditionally.
   * @param headquarterId - Branch id of the target student.
   * @param actor - Authenticated user performing the action.
   */
  private assertBranchAccess(headquarterId: string, actor: AuthenticatedUser): void {
    this.logger.log(
      `Asserting branch access for student headquarterId=${headquarterId} actor id=${actor.id}`,
    );

    if (actor.role === Role.ADMIN) {
      this.logger.log(`Branch access granted for ADMIN actor id=${actor.id}`);
      return;
    }

    if (headquarterId !== actor.headquarterId) {
      this.logger.error(
        `Branch access denied studentheadquarterId=${headquarterId}; actor headquarterId=${actor.headquarterId}`,
      );
      throw domainException(STUDENT_DOMAIN_ERRORS.branchAccessDenied);
    }

    this.logger.log(
      `Branch access granted student headquarterId=${headquarterId}; actor headquarterId=${actor.headquarterId}`,
    );
    return;
  }

  /**
   * Verifies the headquarter exists, is not deleted, and is active.
   * @param headquarterId - Branch UUID to validate.
   */
  private async validateHeadquarter(headquarterId: string): Promise<void> {
    this.logger.log(`Validating headquarter id=${headquarterId}`);

    const headquarter = await this.prisma.headquarter.findFirst({
      where: { id: headquarterId, deletedAt: null },
      select: { id: true, isActive: true },
    });

    if (!isDefined(headquarter)) {
      this.logger.error(`Headquarter not found id=${headquarterId}`);
      throw domainException(STUDENT_DOMAIN_ERRORS.headquarterNotFound);
    }

    if (!headquarter.isActive) {
      this.logger.error(`Headquarter is inactive id=${headquarterId}`);
      throw domainException(STUDENT_DOMAIN_ERRORS.headquarterInactive);
    }
    this.logger.log(`Headquarter is active id=${headquarterId}`);
    return;
  }
}
