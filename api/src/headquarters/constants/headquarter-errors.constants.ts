import type { DomainErrorDefinition } from '#util/errors/domain-error.utils';

export const HEADQUARTER_PRISMA_ERRORS = {
  uniqueConflict: 'Headquarter name already exists',
  recordNotFound: 'Headquarter not found',
} as const;

export const HEADQUARTER_DOMAIN_ERRORS = {
  headquarterNotFound: {
    kind: 'NotFound',
    message: 'Headquarter not found',
  } as const satisfies DomainErrorDefinition,
} as const;
