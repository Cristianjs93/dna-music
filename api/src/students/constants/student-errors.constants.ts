import type { DomainErrorDefinition } from '#util/errors/domain-error.utils';

export const STUDENT_PRISMA_ERRORS = {
  uniqueConflict: 'Student with this email, phone, or identity card already exists',
  recordNotFound: 'Student not found',
  foreignKeyViolation: 'Headquarter not found',
} as const;

export const STUDENT_DOMAIN_ERRORS = {
  studentNotFound: {
    kind: 'NotFound',
    message: 'Student not found',
  } as const satisfies DomainErrorDefinition,
  branchAccessDenied: {
    kind: 'Forbidden',
    message: 'You can only access students from your assigned branch',
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
