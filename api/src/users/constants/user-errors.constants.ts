import type { DomainErrorDefinition } from '#util/errors/domain-error.utils.js';

export const USER_PRISMA_ERRORS = {
  uniqueConflict: 'Email already registered',
  recordNotFound: 'User not found',
  foreignKeyViolation: 'Headquarter not found',
} as const;

export const USER_DOMAIN_ERRORS = {
  userNotFound: {
    kind: 'NotFound',
    message: 'User not found',
  } as const satisfies DomainErrorDefinition,
  operatorRequiresHeadquarter: {
    kind: 'BadRequest',
    message: 'OPERADOR users must have a headquarter assigned',
  } as const satisfies DomainErrorDefinition,
  adminMustNotHaveHeadquarter: {
    kind: 'BadRequest',
    message: 'ADMIN users must not have a headquarter assigned',
  } as const satisfies DomainErrorDefinition,
  headquarterNotFound: {
    kind: 'NotFound',
    message: 'Headquarter not found',
  } as const satisfies DomainErrorDefinition,
  headquarterInactive: {
    kind: 'BadRequest',
    message: 'Headquarter is not active',
  } as const satisfies DomainErrorDefinition,
} as const;
