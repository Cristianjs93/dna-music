import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, type Prisma } from '#generated/prisma';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '#/prisma/prisma.service';
import { userPublicSelect, type UserPublic } from './constants/user-public.select';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { isDefined, nonEmptyStringOrElse, nonEmptyStringOrUndefined } from '#util/parse.utils';

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
          password: await this.passwordHash(createUserDto.password),
          role: createUserDto.role,
          headquarterId: this.resolveHeadquarterId(createUserDto.role, createUserDto.headquarterId),
        },
        select: userPublicSelect,
      });
    } catch (error: unknown) {
      this.handlePrismaError(error);
    }
  }

  async findAll(): Promise<UserPublic[]> {
    return this.prisma.user.findMany({
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
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserPublic> {
    const current = await this.prisma.user.findUnique({
      where: { id },
      select: { role: true, headquarterId: true },
    });

    if (!isDefined(current)) {
      throw new NotFoundException(`User not found`);
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
      this.handlePrismaError(error);
    }
  }

  async remove(id: string): Promise<UserPublic> {
    await this.ensureUserExists(id);

    try {
      return await this.prisma.user.delete({
        where: { id },
        select: userPublicSelect,
      });
    } catch (error: unknown) {
      this.handlePrismaError(error);
    }
  }

  private passwordHash(password: string): Promise<string> {
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
        throw new BadRequestException('OPERADOR users must have a headquarter assigned');
      }

      const headquarter = await this.prisma.headquarter.findUnique({
        where: { id: headquarterId },
        select: { id: true, isActive: true },
      });

      if (!isDefined(headquarter)) {
        throw new BadRequestException('Headquarter not found');
      }

      if (!headquarter.isActive) {
        throw new BadRequestException('Headquarter is not active');
      }

      return;
    }

    if (isDefined(headquarterId)) {
      throw new BadRequestException('ADMIN users must not have a headquarter assigned');
    }
  }

  private async ensureUserExists(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!isDefined(user)) {
      throw new NotFoundException(`user not found`);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      throw new ConflictException('email already registered');
    }

    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      throw new NotFoundException('user not found');
    }

    throw error;
  }
}
