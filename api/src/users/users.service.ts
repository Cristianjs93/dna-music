import { Injectable } from '@nestjs/common';
import { Role, type Prisma } from '#generated/prisma';
import * as bcrypt from 'bcrypt';
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
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserPublic> {
    await this.validateHeadquarterAssignment(createUserDto.role, createUserDto.headquarterId);

    try {
      return await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: await this.hashPassword(createUserDto.password),
          role: createUserDto.role,
          headquarterId: this.resolveHeadquarterId(createUserDto.role, createUserDto.headquarterId),
        },
        select: userPublicSelect,
      });
    } catch (error: unknown) {
      rethrowPrismaKnownError(error, USER_PRISMA_ERRORS);
    }
  }

  async findAll(): Promise<UserPublic[]> {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: userPublicSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<UserPublic> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });

    if (!isDefined(user)) {
      throw domainException(USER_DOMAIN_ERRORS.userNotFound);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserPublic> {
    const current = await this.prisma.user.findUnique({
      where: { id },
      select: { role: true, headquarterId: true },
    });

    if (!isDefined(current)) {
      throw domainException(USER_DOMAIN_ERRORS.userNotFound);
    }

    const role = updateUserDto.role ?? current.role;

    const headquarterId = this.resolveHeadquarterId(
      role,
      updateUserDto.headquarterId,
      current.headquarterId,
    );

    await this.validateHeadquarterAssignment(role, headquarterId ?? undefined);

    const data: Prisma.UserUncheckedUpdateInput = {
      name: nonEmptyStringOrUndefined(updateUserDto.name),
      email: nonEmptyStringOrUndefined(updateUserDto.email),
      role,
      headquarterId,
    };

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: userPublicSelect,
      });
    } catch (error: unknown) {
      rethrowPrismaKnownError(error, USER_PRISMA_ERRORS);
    }
  }

  async remove(id: string): Promise<UserPublic> {
    await this.ensureUserExists(id);

    try {
      return await this.prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
        select: userPublicSelect,
      });
    } catch (error: unknown) {
      rethrowPrismaKnownError(error, USER_PRISMA_ERRORS);
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

      const headquarter = await this.prisma.headquarter.findUnique({
        where: { id: headquarterId },
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
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!isDefined(user)) {
      throw domainException(USER_DOMAIN_ERRORS.userNotFound);
    }
  }
}
