import type { DomainErrorDefinition } from '#util/errors/domain-error.utils';

export const AUTH_ERRORS = {
  invalidCredentials: 'Invalid credentials',
} as const;

export const AUTH_DOMAIN_ERRORS = {
  insufficientPermissions: {
    kind: 'Forbidden',
    message: 'Insufficient permissions',
  } as const satisfies DomainErrorDefinition,
  selfUpdateOnly: {
    kind: 'Forbidden',
    message: 'You can only update your own profile',
  } as const satisfies DomainErrorDefinition,
  privilegedFieldsNotAllowed: {
    kind: 'Forbidden',
    message: 'You are not allowed to modify privileged fields',
  } as const satisfies DomainErrorDefinition,
} as const;
