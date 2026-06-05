import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '#generated/prisma';
import { PrismaService } from '#/prisma/prisma.service';
import { isDefined, nonEmptyStringOrUndefined } from '#util/parse.utils';
import { domainException } from '#util/errors/domain-error.utils';
import { rethrowPrismaKnownError } from '#util/errors/prisma-error.utils';
import {
  headquarterPublicSelect,
  type HeadquarterPublic,
} from './constants/headquarter-public.select';
import {
  HEADQUARTER_DOMAIN_ERRORS,
  HEADQUARTER_PRISMA_ERRORS,
} from './constants/headquarter-errors.constants';
import { CreateHeadquarterDto } from './dto/create-headquarter.dto';
import { UpdateHeadquarterDto } from './dto/update-headquarter.dto';
import { SetHeadquarterStatusDto } from './dto/set-headquarter-status.dto';

@Injectable()
export class HeadquartersService {
  private readonly logger = new Logger(HeadquartersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new headquarter; defaults isActive to true when omitted.
   * @param createHeadquarterDto - Branch fields from the request body.
   */
  async create(createHeadquarterDto: CreateHeadquarterDto): Promise<HeadquarterPublic> {
    this.logger.log(`Creating headquarter name=${createHeadquarterDto.name}`);

    try {
      const headquarter = await this.prisma.headquarter.create({
        data: {
          name: createHeadquarterDto.name,
          city: createHeadquarterDto.city,
          address: createHeadquarterDto.address,
          isActive: createHeadquarterDto.isActive ?? true,
        },
        select: headquarterPublicSelect,
      });

      this.logger.log(`Headquarter created id=${headquarter.id}`);
      return headquarter;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to create headquarter name=${createHeadquarterDto.name}`,
        error instanceof Error ? error.stack : String(error),
      );
      rethrowPrismaKnownError(error, HEADQUARTER_PRISMA_ERRORS);
    }
  }

  /** Lists all non-deleted headquarters ordered by name. */
  async findAll(): Promise<HeadquarterPublic[]> {
    this.logger.log('Listing headquarters');
    try {
      const headquarters = await this.prisma.headquarter.findMany({
        where: { deletedAt: null },
        select: headquarterPublicSelect,
        orderBy: { name: 'asc' },
      });

      this.logger.log('Headquarters listed successfully');
      return headquarters;
    } catch (error: unknown) {
      this.logger.error(
        'Failed to list headquarters',
        error instanceof Error ? error.stack : String(error),
      );
      rethrowPrismaKnownError(error, HEADQUARTER_PRISMA_ERRORS);
    }
  }

  /**
   * Returns one active headquarter by id.
   * @param id - Headquarter UUID.
   */
  async findOne(id: string): Promise<HeadquarterPublic> {
    this.logger.log(`Fetching headquarter id=${id}`);

    const headquarter = await this.prisma.headquarter.findFirst({
      where: { id, deletedAt: null },
      select: headquarterPublicSelect,
    });

    if (!isDefined(headquarter)) {
      this.logger.error(`Headquarter not found id=${id}`);
      throw domainException(HEADQUARTER_DOMAIN_ERRORS.headquarterNotFound);
    }

    this.logger.log(`Found headquarter with id=${id}`);
    return headquarter;
  }

  /**
   * Activates or deactivates a headquarter without soft-deleting it.
   * @param id - Headquarter UUID.
   * @param dto - `{ isActive: true | false }`.
   */
  async setStatus(id: string, dto: SetHeadquarterStatusDto): Promise<HeadquarterPublic> {
    this.logger.log(`Setting headquarter id=${id} isActive=${dto.isActive}`);

    await this.ensureHeadquarterExists(id);

    try {
      const headquarter = await this.prisma.headquarter.update({
        where: { id },
        data: { isActive: dto.isActive },
        select: headquarterPublicSelect,
      });

      this.logger.log(`Headquarter status updated id=${id} isActive=${headquarter.isActive}`);
      return headquarter;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to update headquarter status id=${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      rethrowPrismaKnownError(error, HEADQUARTER_PRISMA_ERRORS);
    }
  }

  /**
   * Updates headquarter details (name, city, address); status changes use setStatus.
   * @param id - Headquarter UUID.
   * @param updateHeadquarterDto - Fields to update.
   */
  async update(id: string, updateHeadquarterDto: UpdateHeadquarterDto): Promise<HeadquarterPublic> {
    this.logger.log(`Updating headquarter id=${id}`);

    await this.ensureHeadquarterExists(id);

    const data: Prisma.HeadquarterUncheckedUpdateInput = {
      name: nonEmptyStringOrUndefined(updateHeadquarterDto.name),
      city: nonEmptyStringOrUndefined(updateHeadquarterDto.city),
      address: nonEmptyStringOrUndefined(updateHeadquarterDto.address),
    };

    try {
      const headquarter = await this.prisma.headquarter.update({
        where: { id },
        data,
        select: headquarterPublicSelect,
      });

      this.logger.log(`Headquarter updated id=${id}`);
      return headquarter;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to update headquarter id=${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      rethrowPrismaKnownError(error, HEADQUARTER_PRISMA_ERRORS);
    }
  }

  /**
   * Soft-deletes a headquarter by setting deletedAt.
   * @param id - Headquarter UUID.
   */
  async remove(id: string): Promise<HeadquarterPublic> {
    this.logger.log(`Soft-deleting headquarter id=${id}`);

    await this.ensureHeadquarterExists(id);

    try {
      const headquarter = await this.prisma.headquarter.update({
        where: { id },
        data: { deletedAt: new Date() },
        select: headquarterPublicSelect,
      });

      this.logger.log(`Headquarter soft-deleted id=${id}`);
      return headquarter;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to soft-delete headquarter id=${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      rethrowPrismaKnownError(error, HEADQUARTER_PRISMA_ERRORS);
    }
  }

  /**
   * Throws if the headquarter does not exist or is soft-deleted.
   * @param id - Headquarter UUID.
   */
  private async ensureHeadquarterExists(id: string): Promise<void> {
    this.logger.log(`Ensuring headquarter exists id=${id}`);

    const headquarter = await this.prisma.headquarter.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!isDefined(headquarter)) {
      this.logger.error(`Headquarter not found id=${id}`);
      throw domainException(HEADQUARTER_DOMAIN_ERRORS.headquarterNotFound);
    }
    this.logger.log(`Found headquarter with id=${id}.`);
    return;
  }
}
