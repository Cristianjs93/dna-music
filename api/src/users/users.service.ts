import { Injectable, Logger } from '@nestjs/common';
import { Role, type Prisma } from '#generated/prisma';
import * as bcrypt from 'bcrypt';
import { AUTH_DOMAIN_ERRORS } from '#/auth/constants/auth-errors.constants';
import type { AuthenticatedUser } from '#/auth/interfaces/authenticated-user.interface';
import { PrismaService } from '#/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { userPublicSelect, type UserPublic } from './constants/user-public.select';
import { USER_DOMAIN_ERRORS, USER_PRISMA_ERRORS } from './constants/user-errors.constants';
import { isDefined, nonEmptyStringOrElse, nonEmptyStringOrUndefined } from '#util/parse.utils';
import { domainException } from '#util/errors/domain-error.utils.js';
import { rethrowPrismaKnownError } from '#util/errors/prisma-error.utils.js';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserPublic> {
    this.logger.log(`Creating user email=${createUserDto.email} role=${createUserDto.role}`);

    await this.validateHeadquarterAssignment(createUserDto.role, createUserDto.headquarterId);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: await this.hashPassword(createUserDto.password),
          role: createUserDto.role,
          headquarterId: this.resolveHeadquarterId(createUserDto.role, createUserDto.headquarterId),
        },
        select: userPublicSelect,
      });

      this.logger.log(`User created successfully id=${user.id}`);
      return user;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to create user email=${createUserDto.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      rethrowPrismaKnownError(error, USER_PRISMA_ERRORS);
    }
  }

  async findAll(): Promise<UserPublic[]> {
    this.logger.log('Listing users');

    try {
      const users = await this.prisma.user.findMany({
        where: { deletedAt: null },
        select: userPublicSelect,
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log('Users listed successfully');
      return users;
    } catch (error: unknown) {
      this.logger.error(
        'Failed to list users',
        error instanceof Error ? error.stack : String(error),
      );
      rethrowPrismaKnownError(error, USER_PRISMA_ERRORS);
    }
  }

  async findOne(id: string): Promise<UserPublic> {
    this.logger.log(`Fetching user id=${id}`);

    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: userPublicSelect,
    });

    if (!isDefined(user)) {
      this.logger.error(`User not found id=${id}`);
      throw domainException(USER_DOMAIN_ERRORS.userNotFound);
    }

    this.logger.error(`Found user with id=${id}`);
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    actor: AuthenticatedUser,
  ): Promise<UserPublic> {
    this.logger.log(`Updating user id=${id} actorId=${actor.id}`);

    this.assertUpdatePermissions(id, updateUserDto, actor);

    const current = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: { role: true, headquarterId: true },
    });

    if (!isDefined(current)) {
      this.logger.error(`User not found id=${id}`);
      throw domainException(USER_DOMAIN_ERRORS.userNotFound);
    }

    const role = actor.role === Role.ADMIN ? (updateUserDto.role ?? current.role) : current.role;

    const headquarterId =
      actor.role === Role.ADMIN
        ? this.resolveHeadquarterId(role, updateUserDto.headquarterId, current.headquarterId)
        : current.headquarterId;

    await this.validateHeadquarterAssignment(role, headquarterId ?? undefined);

    const data: Prisma.UserUncheckedUpdateInput = {
      name: nonEmptyStringOrUndefined(updateUserDto.name),
      email: nonEmptyStringOrUndefined(updateUserDto.email),
      role,
      headquarterId,
    };

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
        select: userPublicSelect,
      });

      this.logger.log(`User updated id=${id}`);
      return user;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to update user id=${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      rethrowPrismaKnownError(error, USER_PRISMA_ERRORS);
    }
  }

  async remove(id: string): Promise<UserPublic> {
    this.logger.log(`Soft-deleting user id=${id}`);

    await this.ensureUserExists(id);

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
        select: userPublicSelect,
      });

      this.logger.log(`User soft-deleted id=${id}`);
      return user;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to soft-delete user id=${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      rethrowPrismaKnownError(error, USER_PRISMA_ERRORS);
    }
  }

  private assertUpdatePermissions(
    id: string,
    updateUserDto: UpdateUserDto,
    actor: AuthenticatedUser,
  ): void {
    if (actor.role === Role.ADMIN) {
      return;
    }

    if (id !== actor.id) {
      throw domainException(AUTH_DOMAIN_ERRORS.selfUpdateOnly);
    }

    if (isDefined(updateUserDto.role) || isDefined(updateUserDto.headquarterId)) {
      throw domainException(AUTH_DOMAIN_ERRORS.privilegedFieldsNotAllowed);
    }
  }

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  private resolveHeadquarterId(
    role: Role,
    dtoHeadquarterId: unknown,
    currentHeadquarterId?: string | null,
  ): string | null | undefined {
    if (role === Role.ADMIN) {
      return null;
    }

    return nonEmptyStringOrElse(dtoHeadquarterId, currentHeadquarterId);
  }

  private async validateHeadquarterAssignment(role: Role, headquarterId?: string): Promise<void> {
    if (role === Role.OPERADOR) {
      if (!isDefined(headquarterId)) {
        throw domainException(USER_DOMAIN_ERRORS.operatorRequiresHeadquarter);
      }

      const headquarter = await this.prisma.headquarter.findFirst({
        where: { id: headquarterId, deletedAt: null },
        select: { id: true, isActive: true },
      });

      if (!isDefined(headquarter)) {
        throw domainException(USER_DOMAIN_ERRORS.headquarterNotFound);
      }

      if (!headquarter.isActive) {
        throw domainException(USER_DOMAIN_ERRORS.headquarterInactive);
      }

      return;
    }

    if (isDefined(headquarterId)) {
      throw domainException(USER_DOMAIN_ERRORS.adminMustNotHaveHeadquarter);
    }
  }

  private async ensureUserExists(id: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!isDefined(user)) {
      this.logger.error(`User not found id=${id}`);
      throw domainException(USER_DOMAIN_ERRORS.userNotFound);
    }
    this.logger.error(`Found user with id=${id}. Proceeding to soft-delete.`);
    return;
  }
}
