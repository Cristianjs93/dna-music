import type { HttpException } from '@nestjs/common';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

export type DomainErrorKind = 'BadRequest' | 'NotFound' | 'Conflict' | 'Forbidden';

export interface DomainErrorDefinition {
  kind: DomainErrorKind;
  message: string;
}

/**
 * Converts a domain error definition into a NestJS `HttpException`.
 */
export function domainException(error: DomainErrorDefinition): HttpException {
  switch (error.kind) {
    case 'BadRequest':
      return new BadRequestException(error.message);
    case 'NotFound':
      return new NotFoundException(error.message);
    case 'Conflict':
      return new ConflictException(error.message);
    case 'Forbidden':
      return new ForbiddenException(error.message);
    default:
      return new BadRequestException(error.message);
  }
}
