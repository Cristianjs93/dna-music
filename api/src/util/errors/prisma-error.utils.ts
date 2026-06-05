import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '#generated/prisma';

export interface PrismaErrorMessages {
  /** P2002 — unique constraint violation */
  uniqueConflict?: string;
  /** P2025 — record not found on update/delete */
  recordNotFound?: string;
  /** P2003 — foreign key constraint failed */
  foreignKeyViolation?: string;
}

const DEFAULT_MESSAGES: Required<PrismaErrorMessages> = {
  uniqueConflict: 'Resource already exists',
  recordNotFound: 'Resource not found',
  foreignKeyViolation: 'Related resource not found',
};

export function isPrismaKnownRequestError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

/**
 * Maps Prisma known request errors to Nest HTTP exceptions.
 * Re-throws anything that is not a mapped Prisma code unchanged.
 */
export function rethrowPrismaKnownError(error: unknown, messages: PrismaErrorMessages = {}): never {
  if (!isPrismaKnownRequestError(error)) {
    throw error;
  }

  const resolved = { ...DEFAULT_MESSAGES, ...messages };

  switch (error.code) {
    case 'P2002':
      throw new ConflictException(resolved.uniqueConflict);
    case 'P2025':
      throw new NotFoundException(resolved.recordNotFound);
    case 'P2003':
      throw new BadRequestException(resolved.foreignKeyViolation);
    default:
      throw error;
  }
}
